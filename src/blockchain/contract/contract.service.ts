import { Injectable, NotFoundException } from '@nestjs/common';
import { ethers } from 'ethers';
import {
  Asset,
  Contract,
  IFindOneOptions,
  InjectRepository,
  Repository,
} from '~/database';
import { tokenAbi } from '../abis';
import { NetworkService } from '../network';

@Injectable()
export class ContractService {
  constructor(
    @InjectRepository(Contract)
    private readonly contractRepository: Repository<Contract>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    private readonly networkService: NetworkService,
  ) {}

  async findOne(
    options: IFindOneOptions<Contract> & { throwIfNotFound: true },
  ): Promise<Contract>;
  async findOne(
    options: IFindOneOptions<Contract> & { throwIfNotFound?: false },
  ): Promise<Contract | null>;
  async findOne({ throwIfNotFound, ...options }: IFindOneOptions<Contract>) {
    const data = await this.contractRepository.findOne(options);

    if (!data && throwIfNotFound) {
      throw new NotFoundException('Contract data not found');
    }

    return data;
  }

  async importToken({
    address,
    chainId,
  }: {
    address: string;
    chainId: number;
  }) {
    const networkData = await this.networkService.findOne({
      where: { chainId },
      throwIfNotFound: true,
    });
    const provider = new ethers.JsonRpcProvider(networkData.rpcUrl);
    const contract = new ethers.Contract(address, tokenAbi, provider);
    let tokenName: string;
    let tokenDecimals: number;
    let tokenSymbol: string;
    try {
      tokenName = await contract.name();
      tokenDecimals = Number(await contract.decimals());
      tokenSymbol = await contract.symbol();
    } catch (error) {
      throw new NotFoundException(
        `Token address ${address} not found on network ${networkData.name}`,
      );
    }

    let contractData = await this.contractRepository.findOne({
      where: { address },
    });
    let assetData: Asset | null = null;

    if (!contractData) {
      contractData = new Contract({
        name: tokenName,
        symbol: tokenSymbol,
        decimals: tokenDecimals,
        address,
        network: networkData,
      });
      await this.contractRepository.save(contractData);
    }

    assetData = await this.assetRepository.findOne({
      where: { contractId: contractData.id },
      relations: {
        network: true,
        contract: true,
      },
    });

    if (!assetData) {
      assetData = new Asset({
        name: contractData.name,
        symbol: contractData.symbol,
        decimals: contractData.decimals,
        contract: contractData,
        network: networkData,
      });
      await this.assetRepository.save(assetData);
    }

    return assetData;
  }
}
