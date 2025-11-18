import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTicketStatus } from '../entities';
import { ISeeding } from '../interfaces';
import { PaymentTicketStatusId } from '../constants';

@Injectable()
export class PaymentTicketStatusSeeding implements ISeeding {
  constructor(
    @InjectRepository(PaymentTicketStatus)
    private readonly repository: Repository<PaymentTicketStatus>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new PaymentTicketStatus({
          id: PaymentTicketStatusId.PENDING_PAYMENT,
          name: 'Thanh toán chưa hoàn tất',
        }),
        new PaymentTicketStatus({
          id: PaymentTicketStatusId.PENDING_MINT,
          name: 'Hệ thống đang phát hành vé',
        }),
        new PaymentTicketStatus({
          id: PaymentTicketStatusId.SUCCESS,
          name: 'Thành công',
        }),
        new PaymentTicketStatus({
          id: PaymentTicketStatusId.FAIL,
          name: 'Thất bại',
        }),
      ]);
    }
  }
}
