import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessControlGuard } from './guards';
import { RateLimitingModule } from './rate-limiting';
import { JwtModule } from './jwt';

@Module({
  imports: [RateLimitingModule, JwtModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AccessControlGuard,
    },
  ],
  exports: [JwtModule],
})
export class SecurityModule {}
