import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { EventService } from './event.service';
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
  RedeemTicketDto,
  RequestSchedulePayoutDto,
  TransferTicketDto,
  UpdateEventDto,
  UpdateScheduleDto,
  UpdateTicketTypeDto,
  GetCheckInStatisticsDto,
  GetRevenueStatisticsDto,
} from './dtos';
import { Result, SchemaValidationPipe } from '~/shared';
import {
  buyTicketSchema,
  createEventSchema,
  createScheduleSchema,
  createTicketTypeSchema,
  getMyEventSchema,
  getMyPaymentOrganizerSchema,
  getMyPaymentTicketSchema,
  getOrganizerPaymentTicketSchema,
  getMyTicketSchema,
  getPublicEventSchema,
  redeemTicketSchema,
  requestSchedulePayoutSchema,
  transferTicketSchema,
  updateEventSchema,
  updateScheduleSchema,
  updateTicketTypeSchema,
  getCheckInStatisticsSchema,
  getRevenueStatisticsSchema,
} from './schemas';
import { TUserPayload, UserAuth, UserPayload } from '~/user';
import { SkipAuth } from '~/security';
import { WalletAddress, WalletAuth } from '~/blockchain';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @SkipAuth()
  @Get('category')
  async getCategory() {
    return Result.success({
      data: await this.eventService.getCategory(),
    });
  }

  @SkipAuth()
  @Get('status')
  async getEventStatus() {
    return Result.success({
      data: await this.eventService.getEventStatus(),
    });
  }

  @SkipAuth()
  @Get('payment-ticket-status')
  async getPaymentTicketStatus() {
    return Result.success({
      data: await this.eventService.getPaymentTicketStatus(),
    });
  }

  @UserAuth()
  @Post('')
  async createEvent(
    @Body(new SchemaValidationPipe(createEventSchema))
    createEventDto: CreateEventDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Tạo sự kiện thành công',
      data: await this.eventService.createEvent({
        ...createEventDto,
        userId: user.id,
      }),
    });
  }

  @SkipAuth()
  @Get('public')
  async getPublicEvent(
    @Query(new SchemaValidationPipe(getPublicEventSchema))
    getPublicEventDto: GetPublicEventDto,
  ) {
    return Result.success({
      data: await this.eventService.getPublicEvent(getPublicEventDto),
    });
  }

  @SkipAuth()
  @Get('public/:slug')
  async getPublicEventDetail(@Param('slug') slug: string) {
    return Result.success({
      data: await this.eventService.getPublicEventDetail({ slug }),
    });
  }

  @UserAuth()
  @Get('')
  async getMyEvent(
    @Query(new SchemaValidationPipe(getMyEventSchema))
    getMyEventDto: GetMyEventDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getMyEvent({
        ...getMyEventDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Post('schedule')
  async createSchedule(
    @Body(new SchemaValidationPipe(createScheduleSchema))
    createScheduleDto: CreateScheduleDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Tạo suất diễn thành công',
      data: await this.eventService.createSchedule({
        ...createScheduleDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Put('schedule/:id')
  async updateSchedule(
    @Param('id') scheduleId: number,
    @Body(new SchemaValidationPipe(updateScheduleSchema))
    updateScheduleDto: UpdateScheduleDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Cập nhật suất diễn thành công',
      data: await this.eventService.updateSchedule({
        ...updateScheduleDto,
        scheduleId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Delete('schedule/:id')
  async deleteSchedule(
    @Param('id') scheduleId: number,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Xóa suất diễn thành công',
      data: await this.eventService.deleteSchedule({
        scheduleId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Post('ticket-type')
  async createTicketType(
    @Body(new SchemaValidationPipe(createTicketTypeSchema))
    createTicketTypeDto: CreateTicketTypeDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Tạo loại vé thành công',
      data: await this.eventService.createTicketType({
        ...createTicketTypeDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Put('ticket-type/:id')
  async updateTicketType(
    @Param('id') ticketTypeId: number,
    @Body(new SchemaValidationPipe(updateTicketTypeSchema))
    updateTicketTypeDto: UpdateTicketTypeDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Cập nhật loại vé thành công',
      data: await this.eventService.updateTicketType({
        ...updateTicketTypeDto,
        ticketTypeId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Delete('ticket-type/:id')
  async deleteTicketType(
    @Param('id') ticketTypeId: number,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Xóa loại vé thành công',
      data: await this.eventService.deleteTicketType({
        ticketTypeId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Get('schedule')
  async getMySchedule(
    @Query('eventId') eventId: number,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getMySchedule({ eventId, userId: user.id }),
    });
  }

  @UserAuth()
  @Get('ticket-type')
  async getMyTicketType(
    @Query('scheduleId') scheduleId: number,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getMyTicketType({
        scheduleId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Patch(':id')
  async updateEvent(
    @Param('id') eventId: number,
    @Body(new SchemaValidationPipe(updateEventSchema))
    updateEventDto: UpdateEventDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Cập nhật sự kiện thành công',
      data: await this.eventService.updateEvent({
        ...updateEventDto,
        eventId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Delete(':id')
  async deleteEvent(
    @Param('id') eventId: number,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Xóa sự kiện thành công',
      data: await this.eventService.deleteEvent({
        eventId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Get('ticket')
  async getMyTicket(
    @Query(new SchemaValidationPipe(getMyTicketSchema))
    getMyTicketDto: GetMyTicketDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getMyTicket({
        ...getMyTicketDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Get('ticket/:id')
  async getMyTicketDetail(
    @Param('id') ticketId: number,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getMyTicketDetail({
        ticketId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @WalletAuth()
  @Get('ticket/:id/qr-code')
  async getTicketQrCode(
    @Param('id') ticketId: number,
    @UserPayload() user: TUserPayload,
    @WalletAddress() walletAddress: string,
  ) {
    return Result.success({
      data: await this.eventService.getTicketQrCode({
        ticketId,
        userId: user.id,
        walletAddress,
      }),
    });
  }

  @UserAuth()
  @Get('payment-ticket')
  async getMyPaymentTicket(
    @Query(new SchemaValidationPipe(getMyPaymentTicketSchema))
    getMyPaymentTicketDto: GetMyPaymentTicketDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getMyPaymentTicket({
        ...getMyPaymentTicketDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Get('organizer/payment-ticket')
  async getOrganizerPaymentTicket(
    @Query(new SchemaValidationPipe(getOrganizerPaymentTicketSchema))
    getOrganizerPaymentTicketDto: GetOrganizerPaymentTicketDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getOrganizerPaymentTicket({
        ...getOrganizerPaymentTicketDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Post('redeem-ticket')
  async redeemTicket(
    @Body(new SchemaValidationPipe(redeemTicketSchema))
    redeemTicketDto: RedeemTicketDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Xác thực vé thành công',
      data: await this.eventService.redeemTicket({
        ...redeemTicketDto,
        organizerId: user.id,
      }),
    });
  }

  @UserAuth()
  @WalletAuth()
  @Post('transfer-ticket')
  async transferTicket(
    @Body(new SchemaValidationPipe(transferTicketSchema))
    transferTicketDto: TransferTicketDto,
    @UserPayload() user: TUserPayload,
    @WalletAddress() walletAddress: string,
  ) {
    return Result.success({
      message: 'Chuyển vé thành công',
      data: await this.eventService.transferTicket({
        ...transferTicketDto,
        userId: user.id,
        walletAddress,
      }),
    });
  }

  @SkipAuth()
  @Get('payment-organizer-status')
  async getPaymentOrganizerStatus() {
    return Result.success({
      data: await this.eventService.getPaymentOrganizerStatus(),
    });
  }

  @UserAuth()
  @WalletAuth()
  @Post('request-schedule-payout')
  async requestSchedulePayout(
    @Body(new SchemaValidationPipe(requestSchedulePayoutSchema))
    requestSchedulePayoutDto: RequestSchedulePayoutDto,
    @UserPayload() user: TUserPayload,
    @WalletAddress() walletAddress: string,
  ) {
    return Result.success({
      message: 'Yêu cầu thanh toán thành công',
      data: await this.eventService.requestSchedulePayout({
        ...requestSchedulePayoutDto,
        userId: user.id,
        walletAddress,
      }),
    });
  }

  @UserAuth()
  @Get('payment-organizer')
  async getMyPaymentOrganizer(
    @Query(new SchemaValidationPipe(getMyPaymentOrganizerSchema))
    getMyPaymentOrganizerDto: GetMyPaymentOrganizerDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getMyPaymentOrganizer({
        ...getMyPaymentOrganizerDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Get('schedule/:id/payment-organizer')
  async getMyPaymentOrganizerBySchedule(
    @Param('id') scheduleId: number,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getMyPaymentOrganizerBySchedule({
        scheduleId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Get('check-in-statistics')
  async getCheckInStatistics(
    @Query(new SchemaValidationPipe(getCheckInStatisticsSchema))
    getCheckInStatisticsDto: GetCheckInStatisticsDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getCheckInStatistics({
        ...getCheckInStatisticsDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Get('revenue-statistics')
  async getRevenueStatistics(
    @Query(new SchemaValidationPipe(getRevenueStatisticsSchema))
    getRevenueStatisticsDto: GetRevenueStatisticsDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getRevenueStatistics({
        ...getRevenueStatisticsDto,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @Get(':id')
  async getDetailMyEvent(
    @Param('id') eventId: number,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.eventService.getDetailMyEvent({
        eventId,
        userId: user.id,
      }),
    });
  }

  @UserAuth()
  @WalletAuth()
  @Post('buy-ticket')
  async buyTicket(
    @Body(new SchemaValidationPipe(buyTicketSchema))
    buyTicketDto: BuyTicketDto,
    @UserPayload() user: TUserPayload,
    @WalletAddress() walletAddress: string,
  ) {
    return Result.success({
      message: 'Mua vé thành công',
      data: await this.eventService.buyTicket({
        ...buyTicketDto,
        userId: user.id,
        walletAddress,
      }),
    });
  }
}
