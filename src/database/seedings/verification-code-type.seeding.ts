import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationCodeType } from '../entities';
import { ISeeding } from '../interfaces';
import { VerificationCodeTypeId } from '../constants';

@Injectable()
export class VerificationCodeTypeSeeding implements ISeeding {
  constructor(
    @InjectRepository(VerificationCodeType)
    private readonly repository: Repository<VerificationCodeType>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new VerificationCodeType({
          id: VerificationCodeTypeId.VERIFY_EMAIL,
          name: 'Verify email',
        }),
        new VerificationCodeType({
          id: VerificationCodeTypeId.RESET_PASSWORD,
          name: 'Reset password',
        }),
      ]);
    }
  }
}
