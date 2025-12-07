import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentOrganizerStatus } from '../entities';
import { ISeeding } from '../interfaces';
import { PaymentOrganizerStatusId } from '../constants';

@Injectable()
export class PaymentOrganizerStatusSeeding implements ISeeding {
  constructor(
    @InjectRepository(PaymentOrganizerStatus)
    private readonly repository: Repository<PaymentOrganizerStatus>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new PaymentOrganizerStatus({
          id: PaymentOrganizerStatusId.PENDING,
          name: 'Hệ thống đang xử lý thanh toán',
        }),
        new PaymentOrganizerStatus({
          id: PaymentOrganizerStatusId.SUCCESS,
          name: 'Thanh toán thành công',
        }),
      ]);
    }
  }
}
