import { Module } from '@nestjs/common';
import { AddressScanService } from './address-scan.service';

@Module({
  providers: [AddressScanService],
  exports: [AddressScanService],
})
export class AddressScanModule {}
