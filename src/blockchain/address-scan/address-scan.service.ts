import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { AddressScan, InjectRepository, Repository } from '~/database';

@Injectable()
export class AddressScanService {
  constructor(
    @InjectRepository(AddressScan)
    private readonly addressScanRepository: Repository<AddressScan>,
  ) {}

  async getBlockNumber({
    address,
    chainId,
  }: {
    address: string;
    chainId: number;
  }) {
    const scannedAddress = await this.addressScanRepository.findOne({
      where: { address, chainId },
    });
    return scannedAddress?.blockNumber?.toString() || 0;
  }

  async update({
    address,
    chainId,
    blockNumber,
  }: {
    address: string;
    chainId: number;
    blockNumber: string;
  }) {
    let scannedAddress = await this.addressScanRepository.findOne({
      where: { address, chainId },
    });
    if (!scannedAddress) {
      scannedAddress = new AddressScan({ address, chainId });
    }
    scannedAddress.blockNumber = new Decimal(blockNumber);

    await this.addressScanRepository.save(scannedAddress);
  }
}
