import { Injectable } from '@nestjs/common';
import { ISeeding } from '../interfaces';
import { InjectRepository } from '@nestjs/typeorm';
import { Contract, Network } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class ContractSeeding implements ISeeding {
  constructor(
    @InjectRepository(Contract)
    private readonly repository: Repository<Contract>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new Contract({
          id: 1,
          name: 'TobeFactory',
          address: '0x47573Aa59a036550C28Ab9A52D989278f8F54cFe',
          network: new Network({
            id: 1,
          }),
        }),
        new Contract({
          id: 2,
          name: 'TobeRouter',
          address: '0x498201a7C88bD5F3F0Ba627Dc878Dc150d8e7074',
          network: new Network({
            id: 1,
          }),
        }),
        new Contract({
          id: 3,
          name: 'TobeBridge',
          address: '0xcaEe5299CD74079d48fED4A192D612C086D73c1a',
          network: new Network({
            id: 1,
          }),
        }),
        new Contract({
          id: 4,
          name: 'TobeBridge',
          address: '0x1D29D379FE6222505345a3e762a44DEe59F21D41',
          network: new Network({
            id: 2,
          }),
        }),
        new Contract({
          id: 5,
          name: 'TobeBridge',
          address: '0x72716d1867b761bc46351ca39949DDecbd9d9781',
          network: new Network({
            id: 3,
          }),
        }),
        new Contract({
          id: 6,
          name: 'HyperNet',
          symbol: 'HNET',
          address: '0x7220130f8A1952CdC103c5489a79ab7C17E7ea94',
          decimals: 18,
          network: new Network({
            id: 1,
          }),
        }),
        new Contract({
          id: 7,
          name: 'FluxWave',
          symbol: 'FLW',
          address: '0x880A4A52AC4AF15Ab24555B078e331e4EE0874D0',
          decimals: 18,
          network: new Network({
            id: 2,
          }),
        }),
        new Contract({
          id: 8,
          name: 'StellarByte',
          symbol: 'STB',
          address: '0x6e37885fcE2Ce9253e15D6cA980B20C88CAf21Df',
          decimals: 18,
          network: new Network({
            id: 3,
          }),
        }),
      ]);
    }
  }
}
