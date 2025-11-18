import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DataSource,
  Event,
  EventSchedule,
  EventStatusId,
  EventTicketType,
  InjectRepository,
  MoreThan,
  Not,
  PaymentTicket,
  PaymentTicketStatusId,
  Repository,
  UserTicket,
} from '~/database';
import {
  BuyTicketDto,
  CreateEventDto,
  CreateScheduleDto,
  CreateTicketTypeDto,
  GetMyEventDto,
  GetPublicEventDto,
  UpdateEventDto,
  UpdateScheduleDto,
  UpdateTicketTypeDto,
} from './dtos';
import { FileService, Folder, isSameFileName } from '~/file';
import { DateTime, dayUTC } from '~/date-time';
import Decimal from 'decimal.js';
import { paginate } from '~/pagination';
import { formatTxhash, fromUnits } from '~/blockchain/utils';
import {
  EVENT_CONTRACT_ADDRESS,
  RPC_URL,
  TRANSACTION_TIMEOUT,
} from '~/blockchain/constants';
import { ethers } from 'ethers';
import { eventAbi } from '~/blockchain/abis';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly fileService: FileService,
    @InjectRepository(PaymentTicket)
    private readonly paymentTicketRepository: Repository<PaymentTicket>,
    @InjectRepository(UserTicket)
    private readonly userTicketRepository: Repository<UserTicket>,
    @InjectRepository(EventSchedule)
    private readonly eventScheduleRepository: Repository<EventSchedule>,
    @InjectRepository(EventTicketType)
    private readonly eventTicketTypeRepository: Repository<EventTicketType>,
    private readonly dataSource: DataSource,
  ) {}

  async createEvent({ image, ...data }: CreateEventDto & { userId: number }) {
    const event = new Event({
      ...data,
      statusId: EventStatusId.DRAFT,
    });

    const newImagePath = await this.fileService.moveFromTemporary({
      fileName: image,
      destinationFolder: Folder.EVENT,
    });
    event.image = newImagePath;
    await this.eventRepository.save(event);

    return event;
  }

  async updateEvent({
    eventId,
    userId,
    ...data
  }: UpdateEventDto & { eventId: number; userId: number }) {
    const event = await this.checkEventOwner({ eventId, userId });

    if (data.name) {
      event.name = data.name;
    }
    if (data.slug) {
      if (await this.isEventSlugExists({ eventId, slug: data.slug })) {
        throw new BadRequestException('Slug already exists');
      }

      event.slug = data.slug;
    }
    if (data.address) {
      event.address = data.address;
    }
    if (data.description) {
      event.description = data.description;
    }
    if (data.image && !isSameFileName(data.image, event.image)) {
      const newImagePath =
        await this.fileService.moveFromTemporaryAndDeleteOldFile({
          fileName: data.image,
          destinationFolder: Folder.EVENT,
          oldFilePath: event.image,
        });
      event.image = newImagePath;
    }
    if (data.categoryId) {
      event.categoryId = data.categoryId;
    }
    if (data.statusId) {
      event.statusId = data.statusId;
    }
    await this.eventRepository.save(event);

    return event;
  }

  async deleteEvent({ eventId, userId }: { eventId: number; userId: number }) {
    const event = await this.checkEventOwner({ eventId, userId });

    const schedulesNotEnded = await this.getSchedulesNotEnded({ eventId });
    const scheduleNotEndedIds = schedulesNotEnded.map(
      (schedule) => schedule.id,
    );
    if (scheduleNotEndedIds.length > 0) {
      const hasPendingPayment = await this.paymentTicketRepository
        .createQueryBuilder('paymentTicket')
        .andWhere('paymentTicket.statusId IN (:...statusIds)', {
          statusIds: [
            PaymentTicketStatusId.PENDING_PAYMENT,
            PaymentTicketStatusId.PENDING_MINT,
          ],
        })
        .andWhere('paymentTicket.scheduleId IN (:...scheduleNotEndedIds)', {
          scheduleNotEndedIds,
        })
        .getExists();
      if (hasPendingPayment) {
        throw new BadRequestException(
          'Sự kiện có thanh toán đang chờ xử lý, không thể xóa',
        );
      }

      const hasNotRedeemedUserTicket = await this.userTicketRepository
        .createQueryBuilder('userTicket')
        .andWhere('userTicket.isRedeemed = :isRedeemed', { isRedeemed: false })
        .andWhere('userTicket.scheduleId IN (:...scheduleNotEndedIds)', {
          scheduleNotEndedIds,
        })
        .getExists();
      if (hasNotRedeemedUserTicket) {
        throw new BadRequestException(
          'Sự kiện có vé chưa được sử dụng, không thể xóa',
        );
      }
    }

    await this.fileService.delete(event.image);
    await this.eventRepository.delete(eventId);
  }

  async isEventSlugExists({
    eventId,
    slug,
  }: {
    eventId: number;
    slug: string;
  }) {
    const isExists = await this.eventRepository.exists({
      where: { slug, id: Not(eventId) },
    });
    return isExists;
  }

  async getSchedulesNotEnded({ eventId }: { eventId: number }) {
    const schedules = await this.eventScheduleRepository.find({
      where: {
        eventId,
        endDate: MoreThan(dayUTC()),
      },
    });
    return schedules;
  }

  async checkEventOwner({
    eventId,
    userId,
  }: {
    eventId: number;
    userId: number;
  }) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, userId },
    });
    if (!event) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }
    return event;
  }

  async checkScheduleOwner({
    scheduleId,
    userId,
  }: {
    scheduleId: number;
    userId: number;
  }) {
    const schedule = await this.eventScheduleRepository.findOne({
      where: { id: scheduleId, event: { userId } },
    });
    if (!schedule) {
      throw new NotFoundException('Không tìm thấy suất diễn');
    }
    return schedule;
  }

  async createSchedule({
    eventId,
    ...data
  }: CreateScheduleDto & { userId: number }) {
    this.checkValidDateRange({
      startDate: dayUTC(data.startDate),
      endDate: dayUTC(data.endDate),
    });

    const event = await this.checkEventOwner({ eventId, userId: data.userId });
    const schedule = new EventSchedule({
      ...data,
      event,
    });
    await this.eventScheduleRepository.save(schedule);

    return schedule;
  }

  async updateSchedule({
    scheduleId,
    ...data
  }: UpdateScheduleDto & { scheduleId: number; userId: number }) {
    this.checkValidDateRange({
      startDate: dayUTC(data.startDate),
      endDate: dayUTC(data.endDate),
    });

    const schedule = await this.checkScheduleOwner({
      scheduleId,
      userId: data.userId,
    });
    schedule.startDate = dayUTC(data.startDate);
    schedule.endDate = dayUTC(data.endDate);
    if (schedule.organizerAddress !== data.organizerAddress) {
      schedule.organizerAddress = data.organizerAddress;
      schedule.assignTxhash = null;
    }
    await this.eventScheduleRepository.save(schedule);

    return schedule;
  }

  async deleteSchedule({
    scheduleId,
    userId,
  }: {
    scheduleId: number;
    userId: number;
  }) {
    const schedule = await this.checkScheduleOwner({ scheduleId, userId });

    const isScheduleNotEnded = schedule.endDate.isAfter(dayUTC());
    if (isScheduleNotEnded) {
      const hasPendingPayment = await this.paymentTicketRepository
        .createQueryBuilder('paymentTicket')
        .andWhere('paymentTicket.statusId IN (:...statusIds)', {
          statusIds: [
            PaymentTicketStatusId.PENDING_PAYMENT,
            PaymentTicketStatusId.PENDING_MINT,
          ],
        })
        .andWhere('paymentTicket.scheduleId = :scheduleId', {
          scheduleId: schedule.id,
        })
        .getExists();
      if (hasPendingPayment) {
        throw new BadRequestException(
          'Sự kiện có thanh toán đang chờ xử lý, không thể xóa',
        );
      }

      const hasNotRedeemedUserTicket = await this.userTicketRepository
        .createQueryBuilder('userTicket')
        .andWhere('userTicket.isRedeemed = :isRedeemed', { isRedeemed: false })
        .andWhere('userTicket.scheduleId = :scheduleId', {
          scheduleId: schedule.id,
        })
        .getExists();
      if (hasNotRedeemedUserTicket) {
        throw new BadRequestException(
          'Sự kiện có vé chưa được sử dụng, không thể xóa',
        );
      }
    }

    await this.eventScheduleRepository.delete(scheduleId);
  }

  checkValidDateRange({
    startDate,
    endDate,
  }: {
    startDate: DateTime;
    endDate: DateTime;
  }) {
    if (startDate.isAfter(endDate)) {
      throw new BadRequestException(
        'Thời gian bắt đầu phải trước thời gian kết thúc',
      );
    }
    if (startDate.isSame(endDate, 'day')) {
      throw new BadRequestException(
        'Thời gian bắt đầu và thời gian kết thúc không được trùng nhau',
      );
    }
  }

  async createTicketType({
    scheduleId,
    ...data
  }: CreateTicketTypeDto & { userId: number }) {
    const price = new Decimal(data.price);
    if (price.isNaN() || price.isZero() || price.isNegative()) {
      throw new BadRequestException('Giá vé không hợp lệ');
    }

    const saleStartDate = dayUTC(data.saleStartDate);
    const saleEndDate = dayUTC(data.saleEndDate);
    this.checkValidDateRange({
      startDate: saleStartDate,
      endDate: saleEndDate,
    });

    const schedule = await this.checkScheduleOwner({
      scheduleId,
      userId: data.userId,
    });

    if (saleEndDate.isAfter(schedule.startDate)) {
      throw new BadRequestException(
        'Thời gian bán vé không được sau thời gian bắt đầu suất diễn',
      );
    }

    const ticketType = new EventTicketType({
      ...data,
      schedule,
      price,
      saleStartDate,
      saleEndDate,
      remainingQuantity: data.originalQuantity,
      eventId: schedule.eventId,
    });
    await this.eventTicketTypeRepository.save(ticketType);

    return ticketType;
  }

  async updateTicketType({
    ticketTypeId,
    userId,
    ...data
  }: UpdateTicketTypeDto & { ticketTypeId: number; userId: number }) {
    const price = new Decimal(data.price);
    if (price.isNaN() || price.isZero() || price.isNegative()) {
      throw new BadRequestException('Giá vé không hợp lệ');
    }

    const saleStartDate = dayUTC(data.saleStartDate);
    const saleEndDate = dayUTC(data.saleEndDate);
    this.checkValidDateRange({
      startDate: saleStartDate,
      endDate: saleEndDate,
    });

    const ticketType = await this.eventTicketTypeRepository.findOne({
      where: { id: ticketTypeId, event: { userId } },
      relations: {
        schedule: true,
      },
    });
    if (!ticketType) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    if (saleEndDate.isAfter(ticketType.schedule.startDate)) {
      throw new BadRequestException(
        'Thời gian bán vé không được sau thời gian bắt đầu suất diễn',
      );
    }

    ticketType.name = data.name;
    ticketType.description = data.description;
    ticketType.price = price;
    ticketType.originalQuantity = data.originalQuantity;
    ticketType.remainingQuantity = data.originalQuantity;
    ticketType.saleStartDate = saleStartDate;
    ticketType.saleEndDate = saleEndDate;
    await this.eventTicketTypeRepository.save(ticketType);

    return ticketType;
  }

  async deleteTicketType({
    ticketTypeId,
    userId,
  }: {
    ticketTypeId: number;
    userId: number;
  }) {
    const ticketType = await this.eventTicketTypeRepository.findOne({
      where: { id: ticketTypeId, event: { userId } },
      relations: {
        schedule: true,
      },
    });
    if (!ticketType) {
      throw new NotFoundException('Không tìm thấy loại vé');
    }

    const schedule = ticketType.schedule;
    const isScheduleNotEnded = schedule.endDate.isAfter(dayUTC());
    if (isScheduleNotEnded) {
      const hasPendingPayment = await this.paymentTicketRepository
        .createQueryBuilder('paymentTicket')
        .andWhere('paymentTicket.statusId IN (:...statusIds)', {
          statusIds: [
            PaymentTicketStatusId.PENDING_PAYMENT,
            PaymentTicketStatusId.PENDING_MINT,
          ],
        })
        .andWhere('paymentTicket.scheduleId = :scheduleId', {
          scheduleId: schedule.id,
        })
        .getExists();
      if (hasPendingPayment) {
        throw new BadRequestException(
          'Sự kiện có thanh toán đang chờ xử lý, không thể xóa',
        );
      }

      const hasNotRedeemedUserTicket = await this.userTicketRepository
        .createQueryBuilder('userTicket')
        .andWhere('userTicket.isRedeemed = :isRedeemed', { isRedeemed: false })
        .andWhere('userTicket.scheduleId = :scheduleId', {
          scheduleId: schedule.id,
        })
        .getExists();
      if (hasNotRedeemedUserTicket) {
        throw new BadRequestException(
          'Sự kiện có vé chưa được sử dụng, không thể xóa',
        );
      }
    }

    await this.eventTicketTypeRepository.delete(ticketTypeId);
  }

  async getMyEvent({
    search,
    statusId,
    limit,
    page,
    userId,
  }: GetMyEventDto & { userId: number }) {
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .andWhere('event.userId = :userId', { userId })
      .leftJoinAndSelect('event.status', 'status')
      .leftJoinAndSelect('event.category', 'category');
    if (search) {
      queryBuilder.andWhere('event.name LIKE :search', {
        search: `%${search}%`,
      });
    }
    if (statusId) {
      queryBuilder.andWhere('event.statusId = :statusId', { statusId });
    }

    return await paginate(queryBuilder, { limit, page });
  }

  async getDetailMyEvent({
    eventId,
    userId,
  }: {
    eventId: number;
    userId: number;
  }) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId, userId },
      relations: {
        status: true,
        category: true,
      },
    });
    if (!event) {
      throw new NotFoundException('Không tìm thấy sự kiện');
    }

    return event;
  }

  async getMySchedule({
    eventId,
    userId,
  }: {
    eventId: number;
    userId: number;
  }) {
    const schedules = await this.eventScheduleRepository.find({
      where: { eventId, event: { userId } },
    });
    return schedules;
  }

  async getMyTicketType({
    scheduleId,
    userId,
  }: {
    scheduleId: number;
    userId: number;
  }) {
    const ticketTypes = await this.eventTicketTypeRepository.find({
      where: { scheduleId, schedule: { event: { userId } } },
    });
    return ticketTypes;
  }

  async getPublicEvent({ search, categoryId, limit, page }: GetPublicEventDto) {
    const nowDateTime = dayUTC();
    const now = nowDateTime.toISOString();
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.category', 'category')
      .andWhere('event.statusId = :statusId', {
        statusId: EventStatusId.ACTIVE,
      })
      .andWhere(
        `EXISTS (
          SELECT 1 FROM event_schedule
          WHERE event_schedule.event_id = event.id
          AND event_schedule.start_date > :now
        )`,
        { now },
      )
      .andWhere(
        `EXISTS (
          SELECT 1 FROM event_ticket_type
          INNER JOIN event_schedule ON event_schedule.id = event_ticket_type.schedule_id
          WHERE event_schedule.event_id = event.id
          AND event_schedule.start_date > :now
          AND event_ticket_type.remaining_quantity > 0
          AND event_ticket_type.sale_end_date > :now
        )`,
        { now },
      );

    if (search) {
      queryBuilder.andWhere('event.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    if (categoryId) {
      queryBuilder.andWhere('event.categoryId = :categoryId', { categoryId });
    }

    queryBuilder.orderBy('event.id', 'DESC');

    const result = await paginate(queryBuilder, { limit, page });

    // For each event, get the minimum startDate schedule and minimum price ticket type
    const eventsWithDetails = await Promise.all(
      result.rows.map(async (event: Event) => {
        // Get schedule with minimum startDate
        const minSchedule = await this.eventScheduleRepository
          .createQueryBuilder('schedule')
          .where('schedule.eventId = :eventId', { eventId: event.id })
          .andWhere('schedule.startDate > :now', { now: nowDateTime })
          .orderBy('schedule.startDate', 'ASC')
          .getOne();

        // Get ticket type with minimum price from all valid schedules
        const minTicketType = await this.eventTicketTypeRepository
          .createQueryBuilder('ticketType')
          .innerJoin('ticketType.schedule', 'schedule')
          .where('schedule.eventId = :eventId', { eventId: event.id })
          .andWhere('schedule.startDate > :now', { now: nowDateTime })
          .andWhere('ticketType.remainingQuantity > 0')
          .andWhere('ticketType.saleEndDate > :now', { now: nowDateTime })
          .orderBy('ticketType.price', 'ASC')
          .getOne();

        return {
          ...event,
          schedule: minSchedule || null,
          ticketType: minTicketType || null,
        };
      }),
    );

    return {
      ...result,
      rows: eventsWithDetails,
    };
  }

  async getPublicEventDetail({ eventId }: { eventId: number }) {
    const event = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.status', 'status')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.schedules', 'schedules')
      .leftJoinAndSelect('schedules.ticketTypes', 'ticketTypes')
      .andWhere('event.id = :eventId', { eventId })
      .andWhere('event.statusId = :statusId', {
        statusId: EventStatusId.ACTIVE,
      })
      .getOne();

    return event;
  }

  async buyTicket({
    paymentTxhash,
    userId,
    walletAddress,
  }: BuyTicketDto & { userId: number; walletAddress: string }) {
    paymentTxhash = formatTxhash(paymentTxhash);

    if (
      await this.paymentTicketRepository.findOne({
        where: { paymentTxhash },
      })
    ) {
      throw new BadRequestException(`Giao dịch ${paymentTxhash} đã tồn tại`);
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const eventInterface = new ethers.Interface(eventAbi);
    const txReceipt = await provider.waitForTransaction(
      paymentTxhash,
      undefined,
      TRANSACTION_TIMEOUT,
    );

    if (!txReceipt || txReceipt.status !== 1) {
      throw new NotFoundException(`Giao dịch ${paymentTxhash} không tồn tại`);
    }

    const ticketPurchasedTransactionParsedLog = txReceipt?.logs
      .map((log) => eventInterface.parseLog(log))
      .find((parsedLog) => {
        return parsedLog?.name === 'TicketPurchased';
      });
    const contractAddress = txReceipt.to!;

    if (!ticketPurchasedTransactionParsedLog) {
      throw new BadRequestException(`Giao dịch ${paymentTxhash} không hợp lệ`);
    }

    if (
      contractAddress.toLowerCase() !== EVENT_CONTRACT_ADDRESS.toLowerCase()
    ) {
      throw new BadRequestException(`Giao dịch ${paymentTxhash} không hợp lệ`);
    }

    if (walletAddress.toLowerCase() !== txReceipt.from.toLowerCase()) {
      throw new UnauthorizedException();
    }

    const args = ticketPurchasedTransactionParsedLog.args;
    const ticketTypeId = Number(args.ticketTypeId);
    const scheduleId = Number(args.scheduleId);
    const ticketTypeQuantity = Number(args.ticketTypeQuantity);
    const tokenAmount = fromUnits(args.tokenAmount as bigint);

    return await this.dataSource.transaction(
      async (transactionalEntityManager) => {
        const ticketType = await transactionalEntityManager
          .getRepository(EventTicketType)
          .createQueryBuilder('ticketType')
          .setLock('pessimistic_write')
          .andWhere('ticketType.id = :ticketTypeId', { ticketTypeId })
          .andWhere('ticketType.scheduleId = :scheduleId', { scheduleId })
          .andWhere('ticketType.remainingQuantity > :ticketTypeQuantity', {
            ticketTypeQuantity,
          })
          .getOne();
        if (!ticketType) {
          throw new NotFoundException('Không tìm thấy loại vé');
        }

        if (!tokenAmount.equals(ticketType.price.mul(ticketTypeQuantity))) {
          throw new BadRequestException('Số tiền không khớp');
        }

        ticketType.remainingQuantity -= ticketTypeQuantity;

        const newPaymentTicket = new PaymentTicket({
          walletAddress,
          paymentTxhash,
          tokenAmount,
          ticketQuantity: ticketTypeQuantity,
          ticketTypeId,
          scheduleId,
          eventId: ticketType.eventId,
          userId,
          statusId: PaymentTicketStatusId.PENDING_MINT,
        });

        await transactionalEntityManager.save([ticketType, newPaymentTicket]);

        return newPaymentTicket;
      },
    );
  }
}
