import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '../entities';
import { ISeeding } from '../interfaces';
import { UserRoleId } from '../constants';

@Injectable()
export class UserRoleSeeding implements ISeeding {
  constructor(
    @InjectRepository(UserRole)
    private readonly repository: Repository<UserRole>,
  ) {}

  async seed() {
    const data = await this.repository.findOne({ where: {} });

    if (!data) {
      await this.repository.save([
        new UserRole({
          id: UserRoleId.ADMIN,
          name: 'Admin',
        }),
        new UserRole({
          id: UserRoleId.USER,
          name: 'User',
        }),
      ]);
    }
  }
}
