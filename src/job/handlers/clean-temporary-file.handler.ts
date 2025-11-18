import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '~/job/libs/nestjs/schedule';
import { FileService } from '~/file';

@Injectable()
export class CleanTemporaryFileHandler {
  constructor(private readonly fileService: FileService) {}

  @Cron(CronExpression.EVERY_10_MINUTES, {
    name: CleanTemporaryFileHandler.name,
  })
  async handle() {
    await this.fileService.cleanTemporaryFiles();
  }
}
