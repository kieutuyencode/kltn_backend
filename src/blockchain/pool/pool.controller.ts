import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { PoolService } from './pool.service';
import { SkipAuth } from '~/security';
import { Result, SchemaValidationPipe } from '~/shared';
import {
  GetHistoryDto,
  GetPoolDto,
  HandleTransactionDto,
  ImportDto,
} from './dtos';
import {
  getHistorySchema,
  getPoolSchema,
  handleTransactionSchema,
  importSchema,
} from './schemas';

@Controller('pool')
export class PoolController {
  constructor(private readonly poolService: PoolService) {}

  @SkipAuth()
  @Get('')
  async getPool(
    @Query(new SchemaValidationPipe(getPoolSchema))
    query: GetPoolDto,
  ) {
    return Result.success({
      data: await this.poolService.getPool(query),
    });
  }

  @SkipAuth()
  @Get('transaction/type')
  async getTransactionType() {
    return Result.success({
      data: await this.poolService.getTransactionType(),
    });
  }

  @SkipAuth()
  @Post('import')
  async import(
    @Body(new SchemaValidationPipe(importSchema))
    body: ImportDto,
  ) {
    return Result.success({
      data: await this.poolService.import(body),
    });
  }

  @SkipAuth()
  @Get(':poolAddress')
  async getPoolByAddress(@Param('poolAddress') poolAddress: string) {
    return Result.success({
      data: await this.poolService.getPoolByAddress(poolAddress),
    });
  }

  @SkipAuth()
  @Get(':poolAddress/transaction/history')
  async getHistory(
    @Query(new SchemaValidationPipe(getHistorySchema))
    query: GetHistoryDto,
    @Param('poolAddress') poolAddress: string,
  ) {
    return Result.success({
      data: await this.poolService.getTransactionHistory({
        ...query,
        poolAddress,
      }),
    });
  }
}
