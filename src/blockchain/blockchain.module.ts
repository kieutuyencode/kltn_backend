import { Module } from '@nestjs/common';
import { AddressScanModule } from './address-scan';
import { WalletModule } from './wallet';

const modules = [AddressScanModule, WalletModule];

@Module({
  imports: modules,
  exports: modules,
})
export class BlockchainModule {}
