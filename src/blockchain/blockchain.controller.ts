import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SkipAuth } from '~/security';
import { Result, SchemaValidationPipe } from '~/shared';
import { BlockchainService } from './blockchain.service';
import { ContractService } from './contract';
import {
  GetAssetDto,
  GetContractDto,
  GetNetworkDto,
  GetTokenDto,
  ImportTokenDto,
} from './dtos';
import {
  getAssetSchema,
  getContractSchema,
  getNetworkSchema,
  getTokenSchema,
  importTokenSchema,
} from './schemas';

@Controller()
export class BlockchainController {
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly contractService: ContractService,
  ) {}

  @SkipAuth()
  @Get('network')
  async getNetwork(
    @Query(new SchemaValidationPipe(getNetworkSchema))
    query: GetNetworkDto,
  ) {
    return Result.success({
      data: await this.blockchainService.getNetwork(query),
    });
  }

  @SkipAuth()
  @Get('contract')
  async getContract(
    @Query(new SchemaValidationPipe(getContractSchema))
    query: GetContractDto,
  ) {
    return Result.success({
      data: await this.blockchainService.getContract(query),
    });
  }

  @SkipAuth()
  @Get('asset')
  async getAsset(
    @Query(new SchemaValidationPipe(getAssetSchema))
    query: GetAssetDto,
  ) {
    return Result.success({
      data: await this.blockchainService.getAsset(query),
    });
  }

  @SkipAuth()
  @Get('token')
  async getToken(
    @Query(new SchemaValidationPipe(getTokenSchema))
    query: GetTokenDto,
  ) {
    return Result.success({
      data: await this.blockchainService.getToken(query),
    });
  }

  @SkipAuth()
  @Post('token/import')
  async importToken(
    @Body(new SchemaValidationPipe(importTokenSchema))
    body: ImportTokenDto,
  ) {
    return Result.success({
      data: await this.contractService.importToken(body),
    });
  }
}
