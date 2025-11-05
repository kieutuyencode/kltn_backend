import { Controller, Get } from '@nestjs/common';
import { SchedulerRegistry } from '~/job/libs/nestjs/schedule';
import { Result } from '~/shared';
import { SkipAuth } from '~/security';

@Controller('job')
export class JobController {
  constructor(private readonly schedulerRegistry: SchedulerRegistry) {}

  @SkipAuth()
  @Get()
  getJob() {
    const cronJobs = Array.from(this.schedulerRegistry.getCronJobs()).map(
      ([name, job]) => {
        return {
          name,
          cronTime: {
            source: job.cronTime.source,
            timeZone: job.cronTime.timeZone,
          },
          waitForCompletion: job.waitForCompletion,
          lastExecution: job.lastExecution,
        };
      },
    );

    return Result.success({
      data: cronJobs,
    });
  }
}
