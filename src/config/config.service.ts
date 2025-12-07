import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Config, ConfigKey, In, Repository } from '~/database';

@Injectable()
export class ConfigService {
  constructor(
    @InjectRepository(Config)
    private readonly configRepository: Repository<Config>,
  ) {}

  async getClientConfig() {
    const data = await this.configRepository.find({
      where: {
        key: In([
          ConfigKey['VERIFY_EMAIL_CODE_EXPIRES_IN_MINUTES'],
          ConfigKey['RESET_PASSWORD_CODE_EXPIRES_IN_MINUTES'],
          ConfigKey['SELL_TICKET_FEE_RATE'],
        ]),
      },
    });
    return Object.fromEntries(data.map((item) => [item.key, item.value]));
  }

  async getValue(key: string) {
    const data = await this.configRepository.findOne({
      where: {
        key,
      },
    });
    return data?.value;
  }
}
