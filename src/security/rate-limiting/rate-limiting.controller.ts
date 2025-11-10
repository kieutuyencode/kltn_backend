import { Controller, Get, Req } from '@nestjs/common';
import { SkipAuth } from '../decorators';

@Controller()
export class RateLimitingController {
  @SkipAuth()
  @Get('ip')
  getIP(@Req() req: Record<string, any>) {
    return req.ip;
  }
}
