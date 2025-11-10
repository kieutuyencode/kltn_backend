import { Module } from '@nestjs/common';
import { MailModule } from './mail';

@Module({
  imports: [MailModule],
  exports: [MailModule],
})
export class NotificationModule {}
