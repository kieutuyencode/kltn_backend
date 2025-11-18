import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventStatus } from '../entities';
import { ISeeding } from '../interfaces';
import { EventStatusId } from '../constants';

@Injectable()
export class EventStatusSeeding implements ISeeding {
  constructor(
    @InjectRepository(EventStatus)
    private readonly repository: Repository<EventStatus>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new EventStatus({
          id: EventStatusId.DRAFT,
          name: 'Nháp',
        }),
        new EventStatus({
          id: EventStatusId.ACTIVE,
          name: 'Hoạt động',
        }),
        new EventStatus({
          id: EventStatusId.INACTIVE,
          name: 'Không hoạt động',
        }),
      ]);
    }
  }
}
