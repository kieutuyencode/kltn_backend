import { Module } from '@nestjs/common';
import { ScheduleModule } from '~/job/libs/nestjs/schedule';
import { JobController } from './job.controller';
import * as handlers from './handlers';
import { FileModule } from '~/file';

@Module({
  imports: [ScheduleModule.forRoot(), FileModule],
  controllers: [JobController],
  providers: [...Object.values(handlers)],
})
export class JobModule {}
