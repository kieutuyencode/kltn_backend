import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { eventAbi } from '~/blockchain/abis';
import { EVENT_CONTRACT_ADDRESS, RPC_URL } from '~/blockchain/constants';
import {
  Event,
  EventSchedule,
  InjectRepository,
  IsNull,
  PaymentTicket,
  PaymentTicketStatusId,
  Repository,
} from '~/database';
import { EnvironmentVariables } from '~/environment-variables/abstracts';
import { Cron, CronExpression } from '~/job/libs/nestjs/schedule';

@Injectable()
export class EventHandler {
  constructor(
    private readonly env: EnvironmentVariables,
    @InjectRepository(EventSchedule)
    private readonly eventScheduleRepository: Repository<EventSchedule>,
    @InjectRepository(PaymentTicket)
    private readonly paymentTicketRepository: Repository<PaymentTicket>,
  ) {}

  @Cron(CronExpression.EVERY_SECOND, {
    name: `${EventHandler.name}_mintTicket`,
  })
  async mintTicket() {
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
}
