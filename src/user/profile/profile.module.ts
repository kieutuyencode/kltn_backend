import { FileModule } from '~/file';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { Module } from '@nestjs/common';
import { SecurityModule } from '~/security';

@Module({
  imports: [FileModule, SecurityModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
