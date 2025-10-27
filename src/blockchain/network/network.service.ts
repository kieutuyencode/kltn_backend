import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IFindOneOptions,
  InjectRepository,
  Network,
  Repository,
} from '~/database';

@Injectable()
export class NetworkService {
  constructor(
    @InjectRepository(Network)
    private readonly networkRepository: Repository<Network>,
  ) {}

  async findOne(
    options: IFindOneOptions<Network> & { throwIfNotFound: true },
  ): Promise<Network>;
  async findOne(
    options: IFindOneOptions<Network> & { throwIfNotFound?: false },
  ): Promise<Network | null>;
  async findOne({ throwIfNotFound, ...options }: IFindOneOptions<Network>) {
    const data = await this.networkRepository.findOne(options);

    if (!data && throwIfNotFound) {
      throw new NotFoundException('Network data not found');
    }

    return data;
  }
}
