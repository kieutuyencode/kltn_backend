import { applyDecorators, SetMetadata } from '@nestjs/common';
import { ACCESS_CONTROLLED } from '../constants';

export const AccessControlled = () =>
  applyDecorators(SetMetadata(ACCESS_CONTROLLED, true));
