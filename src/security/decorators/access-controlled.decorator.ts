import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ACCESS_CONTROLLED } from '../constants';
import { RateLimitingGuard } from '../rate-limiting/guards';

export const AccessControlled = () =>
  applyDecorators(
    SetMetadata(ACCESS_CONTROLLED, true),
    UseGuards(RateLimitingGuard),
  );
