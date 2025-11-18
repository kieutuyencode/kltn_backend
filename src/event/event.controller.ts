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
  GetPublicEventDto,
  UpdateEventDto,
  UpdateScheduleDto,
  UpdateTicketTypeDto,
} from './dtos';
import { Result, SchemaValidationPipe } from '~/shared';
import {
  buyTicketSchema,
  createEventSchema,
  createScheduleSchema,
  createTicketTypeSchema,
  getMyEventSchema,
  getPublicEventSchema,
  updateEventSchema,
  updateScheduleSchema,
  updateTicketTypeSchema,
} from './schemas';
import { TUserPayload, UserAuth, UserPayload } from '~/user';
import { SkipAuth } from '~/security';
import { WalletAddress, WalletAuth } from '~/blockchain';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

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
  @Get('public/:id')
  async getPublicEventDetail(@Param('id') eventId: number) {
    return Result.success({
      data: await this.eventService.getPublicEventDetail({ eventId }),
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
