import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { EventService } from './event.service';
import { Event } from '~/database/entities/event.entity';
import { JwtAuthGuard } from '~/auth/jwt-auth.guard';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }

  @Get(':id')
  getOne(@Param('id') id: number): Promise<Event> {
    return this.eventService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() data: Partial<Event>) {
    const userId = req.user.id; // Lấy từ token
    return this.eventService.create(data, userId);
  }
}
