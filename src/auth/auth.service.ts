import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '~/database/entities/users.entity';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwt: JwtService,
  ) {}

  // register
  async register(payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    gender?: 'male' | 'female' | 'other';
    avatar?: string;
  }): Promise<Partial<User>> {
    const exists = await this.userRepo.findOne({
      where: { email: payload.email },
    });
    if (exists) throw new BadRequestException('Email đã tồn tại');

    const hashed = await bcrypt.hash(payload.password, 10);
    const user = this.userRepo.create({
      name: payload.name,
      email: payload.email,
      password: hashed,
      phone: payload.phone,
      gender: payload.gender,
      avatar: payload.avatar ?? null,
    });
    const saved = await this.userRepo.save(user);
    // remove password before return
    // using destructure to remove select:false won't include password
    const { password, resetToken, resetTokenExpiresAt, ...rest } = saved as any;
    return rest;
  }

  // login -> trả JWT
  async login(email: string, plainPassword: string) {
    // need to explicitly select password
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) throw new NotFoundException('User không tồn tại');
    const ok = await bcrypt.compare(plainPassword, (user as any).password);
    if (!ok) throw new UnauthorizedException('Mật khẩu không đúng');

    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return {
      accessToken: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    };
  }

  // get profile by id
  async getProfile(userId: number) {
    return this.userRepo.findOneBy({ id: userId });
  }

  // update profile
  async updateProfile(userId: number, data: Partial<User>) {
    // prevent email collision
    if (data.email) {
      const other = await this.userRepo.findOne({
        where: { email: data.email },
      });
      if (other && other.id !== userId)
        throw new BadRequestException('Email đã được sử dụng');
    }
    await this.userRepo.update({ id: userId }, data);
    return this.userRepo.findOneBy({ id: userId });
  }

  // change password (authenticated)
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id: userId })
      .getOne();
    if (!user) throw new NotFoundException('User không tồn tại');

    const ok = await bcrypt.compare(oldPassword, (user as any).password);
    if (!ok) throw new UnauthorizedException('Mật khẩu cũ không đúng');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update({ id: userId }, { password: hashed });
    return { success: true };
  }

  // forgot password -> tạo reset token, lưu DB (dev: trả token trong response)
  async forgotPassword(email: string) {
    const user = await this.userRepo.findOneBy({ email });
    if (!user) throw new NotFoundException('Email không tồn tại');

    const token = randomBytes(20).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 giờ
    await this.userRepo.update(
      { id: user.id },
      { resetToken: token, resetTokenExpiresAt: expiresAt },
    );
    // In production: gửi email chứa link reset (token)
    return { message: 'Reset token created (dev mode)', token, expiresAt };
  }

  // reset by token
  async resetPassword(token: string, newPassword: string) {
    const qb = this.userRepo
      .createQueryBuilder('user')
      .addSelect('user.resetToken')
      .addSelect('user.resetTokenExpiresAt');
    qb.where('user.resetToken = :token', { token });
    const user = await qb.getOne();
    if (!user) throw new BadRequestException('Token không hợp lệ');

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < Date.now()) {
      throw new BadRequestException('Token đã hết hạn');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(
      { id: user.id },
      { password: hashed, resetToken: null, resetTokenExpiresAt: null },
    );
    return { success: true };
  }
}
