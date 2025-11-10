import { Module } from '@nestjs/common';
import { ProfileModule } from './profile';
import { AuthModule } from './auth';

@Module({
  imports: [ProfileModule, AuthModule],
})
export class UserModule {}
