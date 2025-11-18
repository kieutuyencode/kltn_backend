import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { FileModule } from '~/file';
import { SecurityModule } from '~/security';
import { BlockchainModule } from '~/blockchain';

@Module({
  imports: [FileModule, SecurityModule, BlockchainModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
