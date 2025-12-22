import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  DataSource,
  Event,
  EventCategory,
  EventSchedule,
  EventStatus,
  EventStatusId,
  EventTicketType,
  InjectRepository,
  MoreThan,
  Not,
  PaymentOrganizer,
  PaymentOrganizerStatus,
  PaymentOrganizerStatusId,
  PaymentTicket,
  PaymentTicketStatus,
  PaymentTicketStatusId,
  Repository,
  User,
  UserTicket,
} from '~/database';
import {
  BuyTicketDto,
  CreateEventDto,
  CreateScheduleDto,
  CreateTicketTypeDto,
  GetMyEventDto,
  GetMyPaymentOrganizerDto,
  GetMyPaymentTicketDto,
  GetOrganizerPaymentTicketDto,
  GetMyTicketDto,
  GetPublicEventDto,
  TransferTicketDto,
  UpdateEventDto,
  UpdateScheduleDto,
  UpdateTicketTypeDto,
  GetCheckInStatisticsDto,
  GetRevenueStatisticsDto,
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
import { generateOtpCode } from '~/shared';
import { decode, encode, hash, verifyHash } from '~/security';
import { ConfigService } from '~/config';
import { ConfigKey } from '~/database';

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
    @InjectRepository(EventCategory)
    private readonly eventCategoryRepository: Repository<EventCategory>,
    @InjectRepository(EventStatus)
    private readonly eventStatusRepository: Repository<EventStatus>,
    @InjectRepository(PaymentTicketStatus)
    private readonly paymentTicketStatusRepository: Repository<PaymentTicketStatus>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PaymentOrganizer)
    private readonly paymentOrganizerRepository: Repository<PaymentOrganizer>,
    private readonly configService: ConfigService,
    @InjectRepository(PaymentOrganizerStatus)
    private readonly paymentOrganizerStatusRepository: Repository<PaymentOrganizerStatus>,
  ) {}

  async getCategory() {
    const categories = await this.eventCategoryRepository.find();
    return categories;
  }

  async getEventStatus() {
    const statuses = await this.eventStatusRepository.find();
    return statuses;
  }

  async getPaymentTicketStatus() {
    const statuses = await this.paymentTicketStatusRepository.find();
    return statuses;
  }

  async createEvent({ image, ...data }: CreateEventDto & { userId: number }) {
    const event = new Event({
      ...data,
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
      order: { startDate: 'ASC' },
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
      order: { saleStartDate: 'ASC' },
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

  async getPublicEventDetail({ slug }: { slug: string }) {
    const event = await this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.status', 'status')
      .leftJoinAndSelect('event.category', 'category')
      .leftJoinAndSelect('event.user', 'user')
      .leftJoinAndSelect('event.schedules', 'schedules')
      .leftJoinAndSelect('schedules.ticketTypes', 'ticketTypes')
      .andWhere('event.slug = :slug', { slug })
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

    const block = await provider.getBlock(txReceipt.blockNumber);
    const createdAt = dayUTC(block!.timestamp * 1000);
    const ticketPurchasedTransactionParsedLog = txReceipt?.logs
      .map((log) => {
        try {
          return eventInterface.parseLog(log);
        } catch (e) {
          return null; // log không match ABI → bỏ qua
        }
      })
      .find((parsedLog) => parsedLog?.name === 'TicketPurchased');

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
          createdAt,
        });

        await transactionalEntityManager.save([ticketType, newPaymentTicket]);

        return newPaymentTicket;
      },
    );
  }

  async getMyTicket({
    userId,
    isRedeemed,
    limit,
    page,
  }: GetMyTicketDto & { userId: number }) {
    const queryBuilder = this.userTicketRepository
      .createQueryBuilder('userTicket')
      .andWhere('userTicket.userId = :userId', { userId })
      .leftJoinAndSelect('userTicket.ticketType', 'ticketType')
      .leftJoinAndSelect('userTicket.schedule', 'schedule')
      .leftJoinAndSelect('userTicket.event', 'event')
      .leftJoinAndSelect('userTicket.user', 'user')
      .orderBy('userTicket.id', 'DESC');

    if (isRedeemed !== undefined) {
      queryBuilder.andWhere('userTicket.isRedeemed = :isRedeemed', {
        isRedeemed,
      });
    }

    return await paginate(queryBuilder, { limit, page });
  }

  async getMyTicketDetail({
    ticketId,
    userId,
  }: {
    ticketId: number;
    userId: number;
  }) {
    const ticket = await this.userTicketRepository.findOne({
      where: { id: ticketId, userId },
      relations: {
        event: true,
        schedule: true,
        ticketType: true,
      },
    });
    if (!ticket) {
      throw new NotFoundException('Không tìm thấy vé');
    }

    return ticket;
  }

  async getTicketQrCode({
    ticketId,
    userId,
    walletAddress,
  }: {
    ticketId: number;
    userId: number;
    walletAddress: string;
  }) {
    const ticket = await this.userTicketRepository.findOne({
      where: { id: ticketId, userId, walletAddress, isRedeemed: false },
    });
    if (!ticket) {
      throw new NotFoundException('Không tìm thấy vé');
    }

    const qrCode = generateOtpCode();
    const hashedCode = await hash(qrCode);
    ticket.qrCode = hashedCode;
    await this.userTicketRepository.save(ticket);

    return this.encodeQrCode({ qrCode, _ticketId: ticket._ticketId });
  }

  async redeemTicket({
    encodedQrCode,
    organizerId,
  }: {
    encodedQrCode: string;
    organizerId: number;
  }) {
    const { qrCode, _ticketId } = this.decodeQrCode({ encodedQrCode });
    const ticket = await this.userTicketRepository.findOne({
      where: { _ticketId, isRedeemed: false, event: { userId: organizerId } },
    });
    if (!ticket) {
      throw new NotFoundException('Không tìm thấy vé');
    }

    if (!ticket.qrCode) {
      throw new BadRequestException('Mã QR không hợp lệ');
    }

    const isCodeValid = await verifyHash(ticket.qrCode, qrCode);
    if (!isCodeValid) {
      throw new BadRequestException('Mã QR không hợp lệ');
    }

    ticket.isRedeemed = true;
    await this.userTicketRepository.save(ticket);

    return ticket;
  }

  encodeQrCode({ qrCode, _ticketId }: { qrCode: string; _ticketId: number }) {
    return encode({ qrCode, _ticketId });
  }

  decodeQrCode({ encodedQrCode }: { encodedQrCode: string }) {
    try {
      const decoded = decode(encodedQrCode);
      const { qrCode, _ticketId } = JSON.parse(decoded) as {
        qrCode: string;
        _ticketId: number;
      };

      return { qrCode, _ticketId };
    } catch (error) {
      throw new BadRequestException('Mã QR không hợp lệ');
    }
  }

  async getMyPaymentTicket({
    userId,
    statusId,
    limit,
    page,
  }: GetMyPaymentTicketDto & { userId: number }) {
    const queryBuilder = this.paymentTicketRepository
      .createQueryBuilder('paymentTicket')
      .andWhere('paymentTicket.userId = :userId', { userId })
      .leftJoinAndSelect('paymentTicket.ticketType', 'ticketType')
      .leftJoinAndSelect('paymentTicket.schedule', 'schedule')
      .leftJoinAndSelect('paymentTicket.event', 'event')
      .leftJoinAndSelect('paymentTicket.status', 'status')
      .orderBy('paymentTicket.id', 'DESC');

    if (statusId) {
      queryBuilder.andWhere('paymentTicket.statusId = :statusId', { statusId });
    }

    return await paginate(queryBuilder, { limit, page });
  }

  async getOrganizerPaymentTicket({
    userId,
    eventId,
    scheduleId,
    statusId,
    paymentTxhash,
    limit,
    page,
  }: GetOrganizerPaymentTicketDto & { userId: number }) {
    const queryBuilder = this.paymentTicketRepository
      .createQueryBuilder('paymentTicket')
      .leftJoinAndSelect('paymentTicket.ticketType', 'ticketType')
      .leftJoinAndSelect('paymentTicket.schedule', 'schedule')
      .leftJoinAndSelect('paymentTicket.status', 'status')
      .leftJoinAndSelect('paymentTicket.user', 'user')
      .innerJoinAndSelect('paymentTicket.event', 'event')
      .andWhere('event.userId = :userId', { userId })
      .orderBy('paymentTicket.id', 'DESC');

    if (eventId) {
      queryBuilder.andWhere('paymentTicket.eventId = :eventId', { eventId });
    }

    if (scheduleId) {
      queryBuilder.andWhere('paymentTicket.scheduleId = :scheduleId', {
        scheduleId,
      });
    }

    if (statusId) {
      queryBuilder.andWhere('paymentTicket.statusId = :statusId', { statusId });
    }

    if (paymentTxhash) {
      queryBuilder.andWhere('paymentTicket.paymentTxhash = :paymentTxhash', {
        paymentTxhash,
      });
    }

    return await paginate(queryBuilder, { limit, page });
  }

  async transferTicket({
    ticketId,
    email,
    txhash,
    walletAddress,
    userId,
  }: TransferTicketDto & { walletAddress: string; userId: number }) {
    txhash = formatTxhash(txhash);

    const ticket = await this.userTicketRepository.findOne({
      where: { id: ticketId, userId },
    });
    if (!ticket) {
      throw new NotFoundException('Không tìm thấy vé');
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const eventInterface = new ethers.Interface(eventAbi);
    const txReceipt = await provider.waitForTransaction(
      txhash,
      undefined,
      TRANSACTION_TIMEOUT,
    );

    if (!txReceipt || txReceipt.status !== 1) {
      throw new NotFoundException(`Giao dịch ${txhash} không tồn tại`);
    }

    const transferTicketTransactionParsedLog = txReceipt?.logs
      .map((log) => {
        try {
          return eventInterface.parseLog(log);
        } catch (e) {
          return null; // log không match ABI → bỏ qua
        }
      })
      .find((parsedLog) => parsedLog?.name === 'TicketTransferred');

    const contractAddress = txReceipt.to!;

    if (!transferTicketTransactionParsedLog) {
      throw new BadRequestException(`Giao dịch ${txhash} không hợp lệ`);
    }

    if (
      contractAddress.toLowerCase() !== EVENT_CONTRACT_ADDRESS.toLowerCase()
    ) {
      throw new BadRequestException(`Giao dịch ${txhash} không hợp lệ`);
    }

    if (walletAddress.toLowerCase() !== txReceipt.from.toLowerCase()) {
      throw new UnauthorizedException();
    }

    const args = transferTicketTransactionParsedLog.args;
    const _ticketId = Number(args.ticketId);

    if (ticket._ticketId !== _ticketId) {
      throw new BadRequestException('Vé không hợp lệ');
    }

    const receiver = await this.userRepository.findOne({
      where: { email },
    });
    if (!receiver) {
      throw new NotFoundException('Người nhận không tồn tại');
    }

    ticket.userId = receiver.id;
    ticket.walletAddress = args.to;
    await this.userTicketRepository.save(ticket);

    return ticket;
  }

  async getPaymentOrganizerStatus() {
    const statuses = await this.paymentOrganizerStatusRepository.find();
    return statuses;
  }

  async requestSchedulePayout({
    scheduleId,
    userId,
    walletAddress,
  }: {
    scheduleId: number;
    userId: number;
    walletAddress: string;
  }) {
    const paymentOrganizer = await this.paymentOrganizerRepository.findOne({
      where: { scheduleId, userId },
    });
    if (paymentOrganizer) {
      throw new BadRequestException('Thanh toán đã được yêu cầu');
    }

    const schedule = await this.eventScheduleRepository.findOne({
      where: { id: scheduleId, event: { userId } },
    });
    if (!schedule) {
      throw new NotFoundException('Không tìm thấy suất diễn');
    }
    if (schedule.endDate.isAfter(dayUTC())) {
      throw new BadRequestException('Suất diễn chưa kết thúc');
    }

    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const eventContract = new ethers.Contract(
      EVENT_CONTRACT_ADDRESS,
      eventAbi,
      provider,
    );

    let organizerSchedule: string = '';
    try {
      organizerSchedule = await eventContract.getOrganizerSchedule(scheduleId);
    } catch (error) {
      // ignore error
    }
    if (
      organizerSchedule.toLowerCase() !==
      schedule.organizerAddress.toLowerCase()
    ) {
      throw new BadRequestException(
        'Vui lòng đợi hệ thống cập nhật ví tổ chức suất diễn',
      );
    }
    if (
      walletAddress.toLowerCase() !== schedule.organizerAddress.toLowerCase()
    ) {
      throw new UnauthorizedException();
    }

    const feeRate = await this.configService.getValue(
      ConfigKey.SELL_TICKET_FEE_RATE,
    );
    const scheduleBalance = fromUnits(
      (await eventContract.getScheduleBalance(scheduleId)) as bigint,
    );
    const feeAmount = scheduleBalance.mul(feeRate!);
    const receiveAmount = scheduleBalance.sub(feeAmount);

    if (receiveAmount.lessThanOrEqualTo(0)) {
      throw new BadRequestException(
        'Chưa bán được vé nên không thể yêu cầu thanh toán',
      );
    }

    const newPaymentOrganizer = new PaymentOrganizer({
      organizerAddress: schedule.organizerAddress,
      receiveAmount,
      feeAmount,
      scheduleId,
      eventId: schedule.eventId,
      userId,
      statusId: PaymentOrganizerStatusId.PENDING,
    });
    await this.paymentOrganizerRepository.save(newPaymentOrganizer);

    return newPaymentOrganizer;
  }

  async getMyPaymentOrganizer({
    userId,
    statusId,
    limit,
    page,
  }: GetMyPaymentOrganizerDto & { userId: number }) {
    const queryBuilder = this.paymentOrganizerRepository
      .createQueryBuilder('paymentOrganizer')
      .andWhere('paymentOrganizer.userId = :userId', { userId })
      .leftJoinAndSelect('paymentOrganizer.schedule', 'schedule')
      .leftJoinAndSelect('paymentOrganizer.event', 'event')
      .leftJoinAndSelect('paymentOrganizer.status', 'status')
      .orderBy('paymentOrganizer.id', 'DESC');

    if (statusId) {
      queryBuilder.andWhere('paymentOrganizer.statusId = :statusId', {
        statusId,
      });
    }

    return await paginate(queryBuilder, { limit, page });
  }

  async getMyPaymentOrganizerBySchedule({
    userId,
    scheduleId,
  }: {
    userId: number;
    scheduleId: number;
  }) {
    const paymentOrganizer = await this.paymentOrganizerRepository
      .createQueryBuilder('paymentOrganizer')
      .andWhere('paymentOrganizer.userId = :userId', { userId })
      .andWhere('paymentOrganizer.scheduleId = :scheduleId', { scheduleId })
      .leftJoinAndSelect('paymentOrganizer.status', 'status')
      .getOne();

    return paymentOrganizer;
  }

  async getCheckInStatistics({
    scheduleId,
    userId,
  }: GetCheckInStatisticsDto & { userId: number }) {
    // Verify schedule ownership
    await this.checkScheduleOwner({ scheduleId, userId });

    // Get all ticket types for this schedule
    const ticketTypes = await this.eventTicketTypeRepository.find({
      where: { scheduleId },
      order: { saleStartDate: 'ASC' },
    });

    // Get all user tickets for this schedule
    const userTickets = await this.userTicketRepository.find({
      where: { scheduleId },
    });

    // Calculate total tickets sold
    const totalSold = ticketTypes.reduce(
      (sum, type) => sum + (type.originalQuantity - type.remainingQuantity),
      0,
    );

    // Calculate total checked-in tickets
    const totalCheckedIn = userTickets.filter(
      (ticket) => ticket.isRedeemed,
    ).length;

    // Calculate check-in rate
    const checkInRate = totalSold > 0 ? totalCheckedIn / totalSold : 0;

    // Calculate per-ticket-type statistics
    const details = ticketTypes.map((ticketType) => {
      const sold = ticketType.originalQuantity - ticketType.remainingQuantity;
      const checkedIn = userTickets.filter(
        (ticket) => ticket.ticketTypeId === ticketType.id && ticket.isRedeemed,
      ).length;
      const checkInRate = sold > 0 ? checkedIn / sold : 0;

      return {
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        price: ticketType.price.toString(),
        checkedIn,
        sold,
        checkInRate: Math.round(checkInRate * 10000) / 10000, // Round to 4 decimal places
      };
    });

    return {
      overview: {
        totalCheckedIn,
        totalSold,
        checkInRate: Math.round(checkInRate * 10000) / 10000, // Round to 4 decimal places
      },
      details,
    };
  }

  async getRevenueStatistics({
    scheduleId,
    period,
    userId,
  }: GetRevenueStatisticsDto & { userId: number }) {
    // Verify schedule ownership
    await this.checkScheduleOwner({ scheduleId, userId });

    // Get all ticket types for this schedule
    const ticketTypes = await this.eventTicketTypeRepository.find({
      where: { scheduleId },
      order: { saleStartDate: 'ASC' },
    });

    // Calculate date range based on period
    const now = dayUTC();
    const startDate =
      period === '24h' ? now.subtract(1, 'day') : now.subtract(30, 'day');

    // Get successful payment tickets for this schedule
    const successfulPayments = await this.paymentTicketRepository.find({
      where: {
        scheduleId,
        statusId: PaymentTicketStatusId.SUCCESS,
      },
      order: { createdAt: 'ASC' },
    });

    // Calculate total revenue (from successful payments)
    const totalRevenue = successfulPayments.reduce(
      (sum, payment) => sum.plus(payment.tokenAmount),
      new Decimal(0),
    );

    // Calculate total revenue target (all ticket types * price * quantity)
    const totalRevenueTarget = ticketTypes.reduce(
      (sum, type) => sum.plus(type.price.mul(type.originalQuantity)),
      new Decimal(0),
    );

    // Calculate total tickets sold
    const totalTicketsSold = ticketTypes.reduce(
      (sum, type) => sum + (type.originalQuantity - type.remainingQuantity),
      0,
    );

    // Calculate total tickets target
    const totalTicketsTarget = ticketTypes.reduce(
      (sum, type) => sum + type.originalQuantity,
      0,
    );

    // Calculate rates
    const revenueRate = totalRevenueTarget.greaterThan(0)
      ? totalRevenue.div(totalRevenueTarget).toNumber()
      : 0;
    const ticketsRate =
      totalTicketsTarget > 0 ? totalTicketsSold / totalTicketsTarget : 0;

    // Generate chart data (group by date or hour depending on period)
    const chartData: Array<{
      date: string;
      revenue: number;
      ticketsSold: number;
    }> = [];

    // Create a map to aggregate data by date/hour
    const dateMap = new Map<
      string,
      { revenue: Decimal; ticketsSold: number }
    >();

    if (period === '24h') {
      // For 24h period, group by hour
      let currentHour = startDate.startOf('hour');
      while (!currentHour.isAfter(now, 'hour')) {
        const hourKey = currentHour.format('HH:00');
        dateMap.set(hourKey, { revenue: new Decimal(0), ticketsSold: 0 });
        currentHour = currentHour.add(1, 'hour');
      }

      // Aggregate payment tickets by hour
      successfulPayments.forEach((payment) => {
        const paymentDate = dayUTC(payment.createdAt);
        if (!paymentDate.isBefore(startDate, 'hour')) {
          const hourKey = paymentDate.format('HH:00');
          const existing = dateMap.get(hourKey) || {
            revenue: new Decimal(0),
            ticketsSold: 0,
          };
          existing.revenue = existing.revenue.plus(payment.tokenAmount);
          existing.ticketsSold += payment.ticketQuantity;
          dateMap.set(hourKey, existing);
        }
      });
    } else {
      // For 30d period, group by date
      let currentDate = startDate.startOf('day');
      while (!currentDate.isAfter(now, 'day')) {
        const dateKey = currentDate.format('YYYY-MM-DD');
        dateMap.set(dateKey, { revenue: new Decimal(0), ticketsSold: 0 });
        currentDate = currentDate.add(1, 'day');
      }

      // Aggregate payment tickets by date
      successfulPayments.forEach((payment) => {
        const paymentDate = dayUTC(payment.createdAt);
        if (!paymentDate.isBefore(startDate, 'day')) {
          const dateKey = paymentDate.format('YYYY-MM-DD');
          const existing = dateMap.get(dateKey) || {
            revenue: new Decimal(0),
            ticketsSold: 0,
          };
          existing.revenue = existing.revenue.plus(payment.tokenAmount);
          existing.ticketsSold += payment.ticketQuantity;
          dateMap.set(dateKey, existing);
        }
      });
    }

    // Convert map to array and sort by date
    dateMap.forEach((value, date) => {
      chartData.push({
        date,
        revenue: value.revenue.toNumber(),
        ticketsSold: value.ticketsSold,
      });
    });

    chartData.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate per-ticket-type statistics
    const details = ticketTypes.map((ticketType) => {
      const sold = ticketType.originalQuantity - ticketType.remainingQuantity;
      const salesRate =
        ticketType.originalQuantity > 0
          ? sold / ticketType.originalQuantity
          : 0;

      return {
        ticketTypeId: ticketType.id,
        ticketTypeName: ticketType.name,
        price: ticketType.price.toString(),
        sold,
        total: ticketType.originalQuantity,
        salesRate: Math.round(salesRate * 10000) / 10000, // Round to 4 decimal places
      };
    });

    return {
      overview: {
        totalRevenue: totalRevenue.toString(),
        totalRevenueTarget: totalRevenueTarget.toString(),
        revenueRate: Math.round(revenueRate * 10000) / 10000, // Round to 4 decimal places
        totalTicketsSold,
        totalTicketsTarget,
        ticketsRate: Math.round(ticketsRate * 10000) / 10000, // Round to 4 decimal places
      },
      chart: chartData,
      details,
    };
  }
}
