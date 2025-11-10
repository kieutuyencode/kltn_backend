import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { UserPayload } from '../decorators';
import { TUserPayload } from '../types';
import { ProfileService } from './profile.service';
import { Result, SchemaValidationPipe } from '~/shared';
import { UserAuth } from '../decorators';
import { updateProfileSchema } from './schemas';
import { UpdateProfileDto } from './dtos';

@Controller('user/profile')
@UserAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@UserPayload() user: TUserPayload) {
    return Result.success({
      data: await this.profileService.getProfile(user.id),
    });
  }

  @Patch()
  async updateProfile(
    @Body(new SchemaValidationPipe(updateProfileSchema)) body: UpdateProfileDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      data: await this.profileService.updateProfile({
        ...body,
        userId: user.id,
      }),
    });
  }
}
