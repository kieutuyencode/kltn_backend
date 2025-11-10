import { SkipThrottle } from '@nestjs/throttler';

export const SkipRateLimiting = () => {
  return SkipThrottle({
    short: true,
    medium: true,
    long: true,
  });
};
