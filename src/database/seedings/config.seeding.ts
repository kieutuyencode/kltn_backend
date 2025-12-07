import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Config } from '../entities';
import { ISeeding } from '../interfaces';
import { ConfigKey } from '../constants';

@Injectable()
export class ConfigSeeding implements ISeeding {
  constructor(
    @InjectRepository(Config)
    private readonly repository: Repository<Config>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new Config({
          id: 1,
          key: ConfigKey.VERIFY_EMAIL_CODE_EXPIRES_IN_MINUTES,
          value: '5',
        }),
        new Config({
          id: 2,
          key: ConfigKey.RESET_PASSWORD_CODE_EXPIRES_IN_MINUTES,
          value: '5',
        }),
        new Config({
          id: 3,
          key: ConfigKey.SELL_TICKET_FEE_RATE,
          value: '0.05',
        }),
      ]);
    }
  }
}
