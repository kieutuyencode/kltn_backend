import { HttpException, HttpStatus } from '@nestjs/common';

export const isInternalServerError = (exception: unknown) => {
  const status =
    exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

  return status === HttpStatus.INTERNAL_SERVER_ERROR;
};
