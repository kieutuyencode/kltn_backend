import { InjectRepository, Repository, User } from '~/database';
import { UpdateProfileDto } from './dtos';
import { Injectable, NotFoundException } from '@nestjs/common';
import { FileService, Folder } from '~/file';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly fileService: FileService,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        role: true,
        status: true,
      },
    });
    return user;
  }

  async updateProfile({
    userId,
    ...data
  }: UpdateProfileDto & { userId: number }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    if (data.fullName) {
      user.fullName = data.fullName;
    }
    if (data.phone) {
      user.phone = data.phone;
    }
    if (data.avatar && data.avatar !== user.avatar) {
      const newAvatarPath =
        await this.fileService.moveFromTemporaryAndDeleteOldFile({
          fileName: data.avatar,
          destinationFolder: Folder.USER,
          oldFilePath: user.avatar,
        });
      user.avatar = newAvatarPath;
    }
    await this.userRepository.save(user);

    return user;
  }
}
