import { Module } from '@nestjs/common';
import { SwapService } from './swap.service';
import { SwapController } from './swap.controller';
import { NetworkModule } from '../network';
import { ContractModule } from '../contract';
import { WalletModule } from '../wallet';

@Module({
  imports: [NetworkModule, ContractModule, WalletModule],
  controllers: [SwapController],
  providers: [SwapService],
  exports: [SwapService],
})
export class SwapModule {}
