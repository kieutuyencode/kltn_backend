import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { ethers, Interface } from 'ethers';
import {
  Asset,
  Brackets,
  ContractId,
  In,
  InjectRepository,
  Repository,
  SwapHistory,
  SwapPair,
  SwapStatus,
  SwapStatusId,
} from '~/database';
import { dayUTC } from '~/date-time';
import { paginate } from '~/pagination';
import { bridgeAbi } from '../abis';
import {
  CONFIRM_TRANSACTION_TIMEOUT,
  CONFIRMS,
  TRANSACTION_TIMEOUT,
} from '../constants';
import { ContractService } from '../contract';
import { NetworkService } from '../network';
import { fromUnits } from '../utils';
import {
  CompleteTransactionDto,
  GetHistoryDto,
  GetPairDto,
  HandleTransactionDto,
} from './dtos';
import { andWhereEnabled } from './utils';
import { EnvironmentVariables } from '~/environment-variables';

@Injectable({})
export class SwapService {
  constructor(
    @InjectRepository(SwapStatus)
    private readonly swapStatusRepository: Repository<SwapStatus>,
    @InjectRepository(SwapPair)
    private readonly swapPairRepository: Repository<SwapPair>,
    @InjectRepository(SwapHistory)
    private readonly swapHistoryRepository: Repository<SwapHistory>,
    private readonly networkService: NetworkService,
    private readonly contractService: ContractService,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    private readonly env: EnvironmentVariables,
  ) {}

  async getStatus() {
    return await this.swapStatusRepository.find();
  }

  async getPair({ fromAssetId }: GetPairDto) {
    const queryBuilder = this.swapPairRepository
      .createQueryBuilder('swapPair')
      .leftJoinAndSelect('swapPair.fromAsset', 'fromAsset')
      .leftJoinAndSelect('swapPair.toAsset', 'toAsset')
      .leftJoinAndSelect('fromAsset.network', 'fromAssetNetwork')
      .leftJoinAndSelect('fromAsset.contract', 'fromAssetContract')
      .leftJoinAndSelect('toAsset.network', 'toAssetNetwork')
      .leftJoinAndSelect('toAsset.contract', 'toAssetContract');
    andWhereEnabled(queryBuilder);

    if (fromAssetId) {
      queryBuilder.andWhere('swapPair.fromAssetId = :fromAssetId', {
        fromAssetId,
      });
    }

    return await queryBuilder.getMany();
  }

  async getHistory({ limit, page, fromAddress }: GetHistoryDto) {
    const queryBuilder = this.swapHistoryRepository
      .createQueryBuilder('swapHistory')
      .leftJoinAndSelect('swapHistory.status', 'status')
      .leftJoinAndSelect('swapHistory.fromAsset', 'fromAsset')
      .leftJoinAndSelect('swapHistory.toAsset', 'toAsset')
      .leftJoinAndSelect('swapHistory.fromNetwork', 'fromNetwork')
      .leftJoinAndSelect('fromAsset.network', 'fromAssetNetwork')
      .leftJoinAndSelect('fromAsset.contract', 'fromAssetContract')
      .leftJoinAndSelect('toAsset.network', 'toAssetNetwork')
      .leftJoinAndSelect('toAsset.contract', 'toAssetContract')
      .orderBy('swapHistory.createdAt', 'DESC');

    if (fromAddress) {
      queryBuilder.andWhere('swapHistory.fromAddress = :fromAddress', {
        fromAddress,
      });
    }

    return await paginate(queryBuilder, { limit, page });
  }

  async findBridgeContract({
    contractAddress,
    networkId,
  }: {
    contractAddress?: string;
    networkId: number;
  }) {
    return await this.contractService.findOne({
      where: {
        id: In([
          ContractId.BRIDGE_TOBE,
          ContractId.BRIDGE_BNB,
          ContractId.BRIDGE_ETH,
        ]),
        address: contractAddress,
        networkId: networkId,
      },
    });
  }

  getPrivateKey(contractId: ContractId) {
    if (contractId === ContractId.BRIDGE_TOBE) {
      return this.env.PRIVATE_KEY_BRIDGE_TOBE;
    }

    if (contractId === ContractId.BRIDGE_BNB) {
      return this.env.PRIVATE_KEY_BRIDGE_BNB;
    }

    return this.env.PRIVATE_KEY_BRIDGE_ETH;
  }
}
