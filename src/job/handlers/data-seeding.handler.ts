import { Injectable } from '@nestjs/common';
import {
  ConfigSeeding,
  UserRoleSeeding,
  UserStatusSeeding,
  VerificationCodeTypeSeeding,
} from '~/database';
import { Timeout } from '~/job/libs/nestjs/schedule';

@Injectable()
export class DataSeedingHandler {
  constructor(
    private readonly configSeeding: ConfigSeeding,
    private readonly userRoleSeeding: UserRoleSeeding,
    private readonly userStatusSeeding: UserStatusSeeding,
    private readonly verificationCodeTypeSeeding: VerificationCodeTypeSeeding,
  ) {}

  @Timeout(DataSeedingHandler.name, 0)
  async handle() {
    const seedings = [
      this.configSeeding,
      this.userRoleSeeding,
      this.userStatusSeeding,
      this.verificationCodeTypeSeeding,
    ];

    for (const seeding of seedings) {
      await seeding.seed();
    }
  }
}
