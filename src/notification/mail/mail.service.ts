import { Injectable } from '@nestjs/common';
import { MailTransportOptions } from './abstracts';
import { MAIL_TEMPLATES_ROOT_PATH } from './constants';
import fse from 'fs-extra';
import path from 'path';
import handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import { TMailOptions } from './types';

@Injectable()
export class MailService {
  constructor(private readonly mailTransportOptions: MailTransportOptions) {}

  async sendEmailVerification({
    to,
    name,
    verificationCode,
    expiresInMinutes,
  }: {
    to: string;
    name: string;
    verificationCode: string;
    expiresInMinutes: number;
  }) {
    const result = await this.send({
      to,
      subject: 'Xác thực Email - Kích hoạt tài khoản',
      template: 'email-verification',
      context: {
        name,
        verificationCode,
        expiresInMinutes,
      },
    });
    return result;
  }

  async sendForgotPassword({
    to,
    name,
    resetCode,
    expiresInMinutes,
  }: {
    to: string;
    name: string;
    resetCode: string;
    expiresInMinutes: number;
  }) {
    const result = await this.send({
      to,
      subject: 'Yêu cầu đặt lại mật khẩu',
      template: 'forgot-password',
      context: {
        name,
        resetCode,
        expiresInMinutes,
      },
    });
    return result;
  }

  async send(options: TMailOptions) {
    const html = await this.compileTemplate(options.template, options.context);
    const mailOptions = { html, ...options };

    const transporter = nodemailer.createTransport(this.mailTransportOptions);
    const result = await transporter.sendMail(mailOptions);

    return result;
  }

  private async compileTemplate(template: string, context: unknown) {
    const templatePath = path.join(MAIL_TEMPLATES_ROOT_PATH, `${template}.hbs`);
    const templateContent = await fse.readFile(templatePath, 'utf8');
    return handlebars.compile(templateContent)(context);
  }
}
