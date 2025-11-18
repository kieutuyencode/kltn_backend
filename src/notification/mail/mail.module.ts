import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailTransportOptions } from './abstracts';
import { EnvironmentVariables } from '~/environment-variables';

@Module({
  providers: [
    {
      provide: MailTransportOptions,
      useFactory: (env: EnvironmentVariables): MailTransportOptions => {
        return {
          host: env.MAIL_HOST,
          port: env.MAIL_PORT,
          secure: false,
          auth: {
            user: env.MAIL_USER,
            pass: env.MAIL_PASSWORD,
          },
          from: {
            name: env.MAIL_FROM_NAME,
            address: env.MAIL_USER,
          },
        };
      },
      inject: [EnvironmentVariables],
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
