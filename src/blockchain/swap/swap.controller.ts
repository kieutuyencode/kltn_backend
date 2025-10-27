import { Controller, Get, Query } from '@nestjs/common';
import { SkipAuth } from '~/security';
import { Result, SchemaValidationPipe } from '~/shared';
import { GetHistoryDto, GetPairDto } from './dtos';
import { getHistorySchema, getPairSchema } from './schemas';
import { SwapService } from './swap.service';

@Controller('swap')
export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  @SkipAuth()
  @Get('status')
  async getStatus() {
    return Result.success({
      data: await this.swapService.getStatus(),
    });
  }

  @SkipAuth()
  @Get('pair')
  async getPair(
    @Query(new SchemaValidationPipe(getPairSchema)) query: GetPairDto,
  ) {
    return Result.success({
      data: await this.swapService.getPair(query),
    });
  }

  @SkipAuth()
  @Get('history')
  async getHistory(
    @Query(new SchemaValidationPipe(getHistorySchema))
    query: GetHistoryDto,
  ) {
    return Result.success({
      data: await this.swapService.getHistory(query),
    });
  }
}
