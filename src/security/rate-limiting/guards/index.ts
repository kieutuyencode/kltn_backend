import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';
import { CLIENT_ID } from '../../constants';

@Injectable()
export class RateLimitingGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req?.[CLIENT_ID] || req.ip;
  }
}
