import {
  Asset,
  Contract,
  Network,
  InjectRepository,
  Repository,
} from '~/database';
import { GetAssetDto, GetContractDto, GetNetworkDto } from './dtos';

export class BlockchainService {
  constructor(
    @InjectRepository(Network)
    private readonly networkRepository: Repository<Network>,
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async getNetwork({ chainId }: GetNetworkDto) {
    const queryBuilder = this.networkRepository.createQueryBuilder('network');

    if (chainId) {
      queryBuilder.andWhere('network.chainId = :chainId', { chainId });
    }

    return await queryBuilder.getMany();
  }

  async getContract({ address }: GetContractDto) {
    const queryBuilder = this.contractRepository
      .createQueryBuilder('contract')
      .leftJoinAndSelect('contract.network', 'network');

    if (address) {
      queryBuilder.andWhere('contract.address = :address', { address });
    }

    return await queryBuilder.getMany();
  }

  async getAsset({ chainId, address }: GetAssetDto) {
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.network', 'network')
      .leftJoinAndSelect('asset.contract', 'contract');

    if (address) {
      queryBuilder.andWhere('contract.address = :address', { address });
    }

    if (chainId) {
      queryBuilder.andWhere('network.chainId = :chainId', { chainId });
    }

    return await queryBuilder.getMany();
  }

  async getToken({ chainId, address }: GetAssetDto) {
    const queryBuilder = this.assetRepository
      .createQueryBuilder('asset')
      .andWhere('asset.contractId IS NOT NULL')
      .leftJoinAndSelect('asset.network', 'network')
      .leftJoinAndSelect('asset.contract', 'contract');

    if (address) {
      queryBuilder.andWhere('contract.address = :address', { address });
    }

    if (chainId) {
      queryBuilder.andWhere('network.chainId = :chainId', { chainId });
    }

    return await queryBuilder.getMany();
  }
}
