import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import Decimal from 'decimal.js';
import { ethers, Interface } from 'ethers';
import {
  ContractId,
  InjectRepository,
  Pool,
  PoolTransaction,
  PoolTransactionType,
  PoolTransactionTypeId,
  Repository,
} from '~/database';
import { dayUTC } from '~/date-time';
import { paginate } from '~/pagination';
import { factoryAbi, poolAbi } from '../abis';
import {
  CONFIRM_TRANSACTION_TIMEOUT,
  CONFIRMS,
  TRANSACTION_TIMEOUT,
} from '../constants';
import { ContractService } from '../contract';
import { NetworkService } from '../network';
import { fromUnits } from '../utils';
import {
  GetHistoryDto,
  GetPoolDto,
  HandleTransactionDto,
  ImportDto,
} from './dtos';

@Injectable()
export class PoolService {
  constructor(
    @InjectRepository(PoolTransactionType)
    private readonly poolTransactionTypeRepository: Repository<PoolTransactionType>,
    @InjectRepository(Pool)
    private readonly poolRepository: Repository<Pool>,
    @InjectRepository(PoolTransaction)
    private readonly poolTransactionRepository: Repository<PoolTransaction>,
    private readonly networkService: NetworkService,
    private readonly contractService: ContractService,
  ) {}

  async getTransactionType() {
    return await this.poolTransactionTypeRepository.find();
  }

  async import({ address, chainId }: ImportDto) {
    const networkData = await this.networkService.findOne({
      where: { chainId },
      throwIfNotFound: true,
    });
    const provider = new ethers.JsonRpcProvider(networkData.rpcUrl);
    const poolContract = new ethers.Contract(address, poolAbi, provider);
    let token0Address: string;
    let token1Address: string;
    try {
      token0Address = await poolContract.token0();
      token1Address = await poolContract.token1();
    } catch (error) {
      throw new NotFoundException(
        `Pool contract address ${address} not found on network ${networkData.name}`,
      );
    }

    const factoryData = await this.contractService.findOne({
      where: { id: ContractId.FACTORY_TOBE },
      throwIfNotFound: true,
    });
    const factoryContract = new ethers.Contract(
      factoryData.address,
      factoryAbi,
      provider,
    );
    const pairAddress = await factoryContract.getPair(
      token0Address,
      token1Address,
    );

    if (pairAddress.toLowerCase() !== address.toLowerCase()) {
      throw new NotFoundException(
        `Pool contract address ${address} does not match the pair address for tokens ${token0Address} and ${token1Address}`,
      );
    }

    const token0Data = await this.contractService.importToken({
      address: token0Address,
      chainId,
    });
    const token1Data = await this.contractService.importToken({
      address: token1Address,
      chainId,
    });
    let poolData = await this.poolRepository.findOne({
      where: { address },
      relations: {
        network: true,
        token0: true,
        token1: true,
      },
    });

    if (!poolData) {
      poolData = new Pool({
        address,
        network: networkData,
        token0: token0Data,
        token1: token1Data,
      });
      await this.poolRepository.save(poolData);
    }

    return poolData;
  }

  async getPool({ chainId, address }: GetPoolDto) {
    const queryBuilder = this.poolRepository
      .createQueryBuilder('pool')
      .leftJoinAndSelect('pool.network', 'network')
      .leftJoinAndSelect('pool.token0', 'token0')
      .leftJoinAndSelect('pool.token1', 'token1');

    if (address) {
      queryBuilder.andWhere('pool.address = :address', { address });
    }

    if (chainId) {
      queryBuilder.andWhere('network.chainId = :chainId', { chainId });
    }

    return await queryBuilder.getMany();
  }

  async getPoolByAddress(address: string) {
    const queryBuilder = this.poolRepository
      .createQueryBuilder('pool')
      .leftJoinAndSelect('pool.network', 'network')
      .leftJoinAndSelect('pool.token0', 'token0')
      .leftJoinAndSelect('pool.token1', 'token1')
      .andWhere('pool.address = :address', { address });

    return await queryBuilder.getOne();
  }

  async getTransactionHistory({
    limit,
    page,
    poolAddress,
  }: GetHistoryDto & { poolAddress: string }) {
    const queryBuilder = this.poolTransactionRepository
      .createQueryBuilder('poolTransaction')
      .innerJoin('poolTransaction.pool', 'pool', 'pool.address = :address', {
        address: poolAddress,
      })
      .leftJoinAndSelect('poolTransaction.type', 'type')
      .leftJoinAndSelect('poolTransaction.token0', 'token0')
      .leftJoinAndSelect('poolTransaction.token1', 'token1')
      .orderBy('poolTransaction.createdAt', 'DESC');

    return await paginate(queryBuilder, { limit, page });
  }

  async calculateVolume({
    poolId,
    startDate,
    endDate,
  }: {
    poolId: number;
    startDate?: string;
    endDate?: string;
  }) {
    const queryBuilder = this.poolTransactionRepository
      .createQueryBuilder('poolTransaction')
      .select('SUM(ABS(poolTransaction.amount0))', 'amount0Volume')
      .addSelect('SUM(ABS(poolTransaction.amount1))', 'amount1Volume')
      .andWhere('poolTransaction.typeId = :typeId', {
        typeId: PoolTransactionTypeId.SWAP,
      })
      .andWhere('poolTransaction.poolId = :poolId', {
        poolId,
      });

    if (startDate) {
      queryBuilder.andWhere('poolTransaction.createdAt >= :startDate', {
        startDate,
      });
    }
    if (endDate) {
      queryBuilder.andWhere('poolTransaction.createdAt <= :endDate', {
        endDate,
      });
    }

    const result = await queryBuilder.getRawOne();

    return {
      amount0Volume: new Decimal((result.amount0Volume as string) || 0),
      amount1Volume: new Decimal((result.amount1Volume as string) || 0),
    };
  }

  async calculateVolume24h({ poolId }: { poolId: number }) {
    const now = dayUTC();
    const endDate = now.toISOString();
    const startDate = now.subtract(24, 'hour').toISOString();

    const { amount0Volume, amount1Volume } = await this.calculateVolume({
      poolId,
      startDate,
      endDate,
    });

    return { amount0Volume24h: amount0Volume, amount1Volume24h: amount1Volume };
  }
}
