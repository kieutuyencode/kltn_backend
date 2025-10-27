import { applyDecorators, SetMetadata } from '@nestjs/common';
import { SKIP_AUTH } from '../constants';
import { AccessControlled } from './access-controlled.decorator';

export const SkipAuth = () =>
  applyDecorators(SetMetadata(SKIP_AUTH, true), AccessControlled());
