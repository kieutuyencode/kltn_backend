import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventCategory } from '../entities';
import { ISeeding } from '../interfaces';
import { EventCategoryId } from '../constants';

@Injectable()
export class EventCategorySeeding implements ISeeding {
  constructor(
    @InjectRepository(EventCategory)
    private readonly repository: Repository<EventCategory>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new EventCategory({
          id: EventCategoryId.CONCERT,
          name: 'Nhạc sống',
          slug: 'concert',
        }),
        new EventCategory({
          id: EventCategoryId.FAN_MEETING,
          name: 'Fan meeting',
          slug: 'fan-meeting',
        }),
        new EventCategory({
          id: EventCategoryId.MERCHANDISE,
          name: 'Merchandise',
          slug: 'merchandise',
        }),
        new EventCategory({
          id: EventCategoryId.ART,
          name: 'Sân khấu & Nghệ thuật',
          slug: 'art',
        }),
        new EventCategory({
          id: EventCategoryId.SPORT,
          name: 'Thể thao',
          slug: 'sport',
        }),
        new EventCategory({
          id: EventCategoryId.CONFERENCE,
          name: 'Hội thảo & Cộng đồng',
          slug: 'conference',
        }),
        new EventCategory({
          id: EventCategoryId.COURSE,
          name: 'Khóa học',
          slug: 'course',
        }),
        new EventCategory({
          id: EventCategoryId.NIGHTLIFE,
          name: 'Nightlife',
          slug: 'nightlife',
        }),
        new EventCategory({
          id: EventCategoryId.TRAVEL,
          name: 'Tham quan du lịch',
          slug: 'travel',
        }),
        new EventCategory({
          id: EventCategoryId.OTHER,
          name: 'Khác',
          slug: 'other',
        }),
      ]);
    }
  }
}
