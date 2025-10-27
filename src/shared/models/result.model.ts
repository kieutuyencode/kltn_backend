import { instanceToPlain } from 'class-transformer';

export class Result {
  status: boolean;
  message?: string;
  data?: any;
  detail?: any;

  constructor({
    status,
    message,
    data,
    detail,
  }: {
    status: boolean;
    message?: string;
    data?: any;
    detail?: any;
  }) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.detail = detail;
  }

  static success({
    message,
    data,
    detail,
  }: {
    message?: string;
    data?: any;
    detail?: any;
  }) {
    return new Result({
      status: true,
      message,
      data: instanceToPlain(data),
      detail,
    });
  }

  static fail({
    message,
    data,
    detail,
  }: {
    message?: string;
    data?: any;
    detail?: any;
  }) {
    return new Result({
      status: false,
      message,
      data: instanceToPlain(data),
      detail,
    });
  }
}
