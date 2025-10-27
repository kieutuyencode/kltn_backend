import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { ContractModule } from './contract';
import { PoolModule } from './pool';
import { AddressScanModule } from './address-scan';
import { WalletModule } from './wallet';
import { SwapModule } from './swap';

const modules = [
  ContractModule,
  PoolModule,
  AddressScanModule,
  WalletModule,
  SwapModule,
];

@Module({
  imports: modules,
  controllers: [BlockchainController],
  providers: [BlockchainService],
  exports: modules,
})
export class BlockchainModule {}
