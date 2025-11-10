import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from '~/security';
import { Result } from '~/shared';
import { ConfigService } from './config.service';

@Controller('config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @SkipAuth()
  @Get()
  async getClientConfig() {
    const config = await this.configService.getClientConfig();
    return Result.success({ data: config });
  }
}
