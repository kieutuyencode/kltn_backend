import { Module } from '@nestjs/common';
import { ScheduleModule } from '~/job/libs/nestjs/schedule';
import { JobController } from './job.controller';
import * as handlers from './handlers';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [JobController],
  providers: [...Object.values(handlers)],
})
export class JobModule {}
