import { Injectable } from '@nestjs/common';
import {
  ConfigSeeding,
  EventCategorySeeding,
  EventStatusSeeding,
  PaymentOrganizerStatusSeeding,
  PaymentTicketStatusSeeding,
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
    private readonly eventStatusSeeding: EventStatusSeeding,
    private readonly eventCategorySeeding: EventCategorySeeding,
    private readonly paymentTicketStatusSeeding: PaymentTicketStatusSeeding,
    private readonly paymentOrganizerStatusSeeding: PaymentOrganizerStatusSeeding,
  ) {}

  @Timeout(DataSeedingHandler.name, 0)
  async handle() {
    const seedings = [
      this.configSeeding,
      this.userRoleSeeding,
      this.userStatusSeeding,
      this.verificationCodeTypeSeeding,
      this.eventStatusSeeding,
      this.eventCategorySeeding,
      this.paymentTicketStatusSeeding,
      this.paymentOrganizerStatusSeeding,
    ];

    for (const seeding of seedings) {
      await seeding.seed();
    }
  }
}
