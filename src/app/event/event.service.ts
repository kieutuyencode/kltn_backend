import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '~/database/entities/event.entity';

@Injectable()
export class EventService {
  constructor(@InjectRepository(Event) private eventRepo: Repository<Event>) {}

  async create(data: Partial<Event>, userId: number) {
    const event = this.eventRepo.create({
      ...data,
      creator_id: userId,
    });
    return this.eventRepo.save(event);
  }

  async findAll() {
    return this.eventRepo.find();
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOneBy({ id });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, data: Partial<Event>) {
    const event = await this.findOne(id);
    Object.assign(event, data);
    return this.eventRepo.save(event);
  }

  async remove(id: number) {
    const event = await this.findOne(id);
    return this.eventRepo.remove(event);
  }
}
