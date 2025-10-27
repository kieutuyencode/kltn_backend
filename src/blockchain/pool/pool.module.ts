import { Module } from '@nestjs/common';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { NetworkModule } from '../network';
import { ContractModule } from '../contract';

@Module({
  imports: [NetworkModule, ContractModule],
  controllers: [PoolController],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}
