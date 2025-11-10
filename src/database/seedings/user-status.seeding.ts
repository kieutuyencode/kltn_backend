import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatus } from '../entities';
import { ISeeding } from '../interfaces';
import { UserStatusId } from '../constants';

@Injectable()
export class UserStatusSeeding implements ISeeding {
  constructor(
    @InjectRepository(UserStatus)
    private readonly repository: Repository<UserStatus>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new UserStatus({
          id: UserStatusId.ACTIVE,
          name: 'Active',
        }),
        new UserStatus({
          id: UserStatusId.INACTIVE,
          name: 'Inactive',
        }),
        new UserStatus({
          id: UserStatusId.BLOCKED,
          name: 'Blocked',
        }),
      ]);
    }
  }
}
