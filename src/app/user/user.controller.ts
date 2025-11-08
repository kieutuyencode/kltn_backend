import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '~/database/entities';
import { SkipAuth } from '~/security';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @SkipAuth()
  @Get()
  getAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @SkipAuth()
  @Get(':id')
  getOne(@Param('id') id: number): Promise<User | null> {
    return this.userService.findOne(id);
  }

  @SkipAuth()
  @Post()
  create(@Body() data: Partial<User>): Promise<User | null> {
    return this.userService.create(data);
  }

  @SkipAuth()
  @Put(':id')
  update(
    @Param('id') id: number,
    @Body() data: Partial<User>,
  ): Promise<User | null> {
    return this.userService.update(id, data);
  }

  @SkipAuth()
  @Delete(':id')
  delete(@Param('id') id: number): Promise<void> {
    return this.userService.remove(id);
  }
}
