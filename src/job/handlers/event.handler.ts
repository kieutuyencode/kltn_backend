import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { eventAbi } from '~/blockchain/abis';
import {
  EVENT_CONTRACT_ADDRESS,
  RPC_URL,
  TRANSACTION_TIMEOUT,
} from '~/blockchain/constants';
import { toUnits } from '~/blockchain/utils';
import {
  DataSource,
  EventSchedule,
  InjectRepository,
  IsNull,
  Not,
  PaymentOrganizer,
  PaymentOrganizerStatusId,
  PaymentTicket,
  PaymentTicketStatusId,
  Repository,
  UserTicket,
} from '~/database';
import { dayUTC } from '~/date-time';
import { EnvironmentVariables } from '~/environment-variables/abstracts';
import { Cron, CronExpression } from '~/job/libs/nestjs/schedule';

@Injectable()
export class EventHandler {
  constructor(
    private readonly env: EnvironmentVariables,
    @InjectRepository(PaymentTicket)
    private readonly paymentTicketRepository: Repository<PaymentTicket>,
    @InjectRepository(UserTicket)
    private readonly userTicketRepository: Repository<UserTicket>,
    private readonly dataSource: DataSource,
    @InjectRepository(EventSchedule)
    private readonly eventScheduleRepository: Repository<EventSchedule>,
    @InjectRepository(PaymentOrganizer)
    private readonly paymentOrganizerRepository: Repository<PaymentOrganizer>,
  ) {}

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_mintTicket`,
  })
  async mintTicket() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(
      this.env.EVENT_ADMIN_PRIVATE_KEY,
      provider,
    );
    const contract = new ethers.Contract(
      EVENT_CONTRACT_ADDRESS,
      eventAbi,
      wallet,
    );

    const payments = await this.paymentTicketRepository
      .createQueryBuilder('paymentTicket')
      .leftJoinAndSelect('paymentTicket.ticketType', 'ticketType')
      .leftJoinAndSelect('ticketType.schedule', 'ticketTypeSchedule')
      .leftJoinAndSelect('ticketType.event', 'ticketTypeEvent')
      .andWhere('paymentTicket.statusId = :statusId', {
        statusId: PaymentTicketStatusId.PENDING_MINT,
      })
      .andWhere('paymentTicket.mintTxhash IS NULL')
      .getMany();

    for (const payment of payments) {
      const tx = await contract.mintTicket(
        payment.walletAddress,
        payment.ticketTypeId,
        payment.scheduleId,
        JSON.stringify(payment.ticketType),
        payment.ticketQuantity,
      );

      payment.mintTxhash = tx.hash;
      await this.paymentTicketRepository.save(payment);
    }
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_confirmMintTicket`,
  })
  async confirmMintTicket() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const eventInterface = new ethers.Interface(eventAbi);

    const payments = await this.paymentTicketRepository
      .createQueryBuilder('paymentTicket')
      .andWhere('paymentTicket.statusId = :statusId', {
        statusId: PaymentTicketStatusId.PENDING_MINT,
      })
      .andWhere('paymentTicket.mintTxhash IS NOT NULL')
      .getMany();

    for (const payment of payments) {
      const txReceipt = await provider.waitForTransaction(
        payment.mintTxhash!,
        undefined,
        TRANSACTION_TIMEOUT,
      );

      if (txReceipt && txReceipt.status === 1) {
        const block = await provider.getBlock(txReceipt.blockNumber);
        const createdAt = dayUTC(block!.timestamp * 1000);

        await this.dataSource.transaction(
          async (transactionalEntityManager) => {
            payment.statusId = PaymentTicketStatusId.SUCCESS;

            const ticketsMintedParsedLog = txReceipt?.logs
              .map((log) => {
                try {
                  return eventInterface.parseLog(log);
                } catch (e) {
                  return null; // log không match ABI → bỏ qua
                }
              })
              .filter((parsedLog) => parsedLog?.name === 'TicketMinted');

            const tickets = ticketsMintedParsedLog.map((parsedLog) => {
              const args = parsedLog?.args;
              const _ticketId = Number(args?.ticketId);

              return new UserTicket({
                walletAddress: payment.walletAddress,
                ticketTypeId: payment.ticketTypeId,
                scheduleId: payment.scheduleId,
                eventId: payment.eventId,
                userId: payment.userId,
                _ticketId,
                createdAt,
              });
            });

            await transactionalEntityManager.save([payment, ...tickets]);
          },
        );
      } else {
        payment.mintTxhash = null;
        await this.paymentTicketRepository.save(payment);
      }
    }
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_redeemTicket`,
  })
  async redeemTicket() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(
      this.env.EVENT_ADMIN_PRIVATE_KEY,
      provider,
    );
    const contract = new ethers.Contract(
      EVENT_CONTRACT_ADDRESS,
      eventAbi,
      wallet,
    );

    const tickets = await this.userTicketRepository.find({
      where: {
        isRedeemed: true,
        _isRedeemed: false,
        redeemTxhash: IsNull(),
      },
    });

    for (const ticket of tickets) {
      try {
        const tx = await contract.ticketUsed(ticket._ticketId);

        ticket.redeemTxhash = tx.hash;
        await this.userTicketRepository.save(ticket);
      } catch (error) {
        const ticketDataFromContract = await contract.getTicketDetails(
          ticket._ticketId,
        );

        if (ticketDataFromContract.isUsed) {
          ticket._isRedeemed = true;
          await this.userTicketRepository.save(ticket);
        }
      }
    }
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_confirmRedeemTicket`,
  })
  async confirmRedeemTicket() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const tickets = await this.userTicketRepository.find({
      where: {
        isRedeemed: true,
        _isRedeemed: false,
        redeemTxhash: Not(IsNull()),
      },
    });

    for (const ticket of tickets) {
      const txReceipt = await provider.waitForTransaction(
        ticket.redeemTxhash!,
        undefined,
        TRANSACTION_TIMEOUT,
      );

      if (txReceipt && txReceipt.status === 1) {
        ticket._isRedeemed = true;
        await this.userTicketRepository.save(ticket);
      } else {
        ticket.redeemTxhash = null;
        await this.userTicketRepository.save(ticket);
      }
    }
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_assignScheduleToOrganizer`,
  })
  async assignScheduleToOrganizer() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(
      this.env.EVENT_ADMIN_PRIVATE_KEY,
      provider,
    );
    const contract = new ethers.Contract(
      EVENT_CONTRACT_ADDRESS,
      eventAbi,
      wallet,
    );

    const schedules = await this.eventScheduleRepository
      .createQueryBuilder('schedule')
      .andWhere('schedule.isAssigned = :isAssigned', {
        isAssigned: false,
      })
      .andWhere('schedule.assignTxhash IS NULL')
      .andWhere(
        'EXISTS (SELECT 1 FROM payment_ticket WHERE payment_ticket.schedule_id = schedule.id AND payment_ticket.status_id = :statusId)',
        {
          statusId: PaymentTicketStatusId.SUCCESS,
        },
      )
      .andWhere(
        'NOT EXISTS (SELECT 1 FROM payment_organizer WHERE payment_organizer.schedule_id = schedule.id)',
      )
      .getMany();

    for (const schedule of schedules) {
      const tx = await contract.assignScheduleToOrganizer(
        schedule.id,
        schedule.organizerAddress,
      );

      schedule.assignTxhash = tx.hash;
      await this.eventScheduleRepository.save(schedule);
    }
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_confirmAssignScheduleToOrganizer`,
  })
  async confirmAssignScheduleToOrganizer() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const schedules = await this.eventScheduleRepository.find({
      where: {
        isAssigned: false,
        assignTxhash: Not(IsNull()),
      },
    });

    for (const schedule of schedules) {
      const txReceipt = await provider.waitForTransaction(
        schedule.assignTxhash!,
        undefined,
        TRANSACTION_TIMEOUT,
      );

      if (txReceipt && txReceipt.status === 1) {
        schedule.isAssigned = true;
        await this.eventScheduleRepository.save(schedule);
      } else {
        schedule.assignTxhash = null;
        await this.eventScheduleRepository.save(schedule);
      }
    }
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_withdrawForOrganizer`,
  })
  async withdrawForOrganizer() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(
      this.env.EVENT_ADMIN_PRIVATE_KEY,
      provider,
    );
    const contract = new ethers.Contract(
      EVENT_CONTRACT_ADDRESS,
      eventAbi,
      wallet,
    );

    const payments = await this.paymentOrganizerRepository.find({
      where: {
        statusId: PaymentOrganizerStatusId.PENDING,
        txhash: IsNull(),
      },
    });

    for (const payment of payments) {
      const tx = await contract.withdrawForOrganizer(
        payment.scheduleId,
        toUnits(payment.receiveAmount),
      );

      payment.txhash = tx.hash;
      await this.paymentOrganizerRepository.save(payment);
    }
  }

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_confirmWithdrawForOrganizer`,
  })
  async confirmWithdrawForOrganizer() {
    const provider = new ethers.JsonRpcProvider(RPC_URL);

    const payments = await this.paymentOrganizerRepository.find({
      where: {
        statusId: PaymentOrganizerStatusId.PENDING,
        txhash: Not(IsNull()),
      },
    });

    for (const payment of payments) {
      const txReceipt = await provider.waitForTransaction(
        payment.txhash!,
        undefined,
        TRANSACTION_TIMEOUT,
      );

      if (txReceipt && txReceipt.status === 1) {
        payment.statusId = PaymentOrganizerStatusId.SUCCESS;
        await this.paymentOrganizerRepository.save(payment);
      } else {
        payment.txhash = null;
        await this.paymentOrganizerRepository.save(payment);
      }
    }
  }
}
