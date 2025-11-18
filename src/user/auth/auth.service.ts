import {
  ConfigKey,
  InjectRepository,
  MoreThan,
  Repository,
  User,
  UserRoleId,
  UserStatusId,
  VerificationCode,
  VerificationCodeTypeId,
} from '~/database';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResendVerifyEmailDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from './dtos';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { hash, JwtService, verifyHash } from '~/security';
import { ConfigService } from '~/config';
import { generateOtpCode } from '~/shared';
import { dayUTC } from '~/date-time';
import { MailService } from '~/notification';
import { TUserPayload } from '../types';

export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    @InjectRepository(VerificationCode)
    private readonly verificationCodeRepository: Repository<VerificationCode>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp({ email, fullName, password }: SignUpDto) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (user) {
      throw new BadRequestException('Email đã tồn tại');
    }

    const hashedPassword = await hash(password);
    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
      roleId: UserRoleId.USER,
      statusId: UserStatusId.INACTIVE,
    });
    await this.userRepository.save(newUser);

    await this.generateAndSendEmailVerificationCode({
      userId: newUser.id,
      email,
      fullName,
    });

    return newUser;
  }

  async signIn({ email, password }: SignInDto) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException('Tài khoản hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await verifyHash(user.password, password);
    if (!isPasswordValid) {
      throw new BadRequestException('Tài khoản hoặc mật khẩu không chính xác');
    }

    if (user.statusId === UserStatusId.INACTIVE) {
      throw new BadRequestException('Tài khoản của bạn chưa được xác thực');
    }

    if (user.statusId === UserStatusId.BLOCKED) {
      throw new BadRequestException('Tài khoản của bạn đã bị khóa');
    }

    const payload: TUserPayload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      statusId: user.statusId,
    };
    const accessToken = this.jwtService.signToken(payload);

    return {
      accessToken,
      user,
    };
  }

  async verifyEmail({ email, code }: VerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      return;
    }
    if (user.statusId !== UserStatusId.INACTIVE) {
      return;
    }

    await this.verifyCode({
      userId: user.id,
      code,
      typeId: VerificationCodeTypeId.VERIFY_EMAIL,
    });

    user.statusId = UserStatusId.ACTIVE;
    await this.userRepository.save(user);
  }

  async resendVerifyEmail({ email }: ResendVerifyEmailDto) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      return;
    }
    if (user.statusId !== UserStatusId.INACTIVE) {
      return;
    }

    await this.generateAndSendEmailVerificationCode({
      userId: user.id,
      email,
      fullName: user.fullName,
    });
  }

  async verifyCode({
    userId,
    code,
    typeId,
  }: {
    userId: number;
    code: string;
    typeId: VerificationCodeTypeId;
  }) {
    const verificationCode = await this.verificationCodeRepository.findOne({
      where: { typeId, userId, expiresAt: MoreThan(dayUTC()) },
    });
    if (!verificationCode) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
    }

    const isCodeValid = await verifyHash(verificationCode.code, code);
    if (!isCodeValid) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn');
    }

    await this.verificationCodeRepository.remove(verificationCode);
  }

  async generateVerificationCode({
    userId,
    typeId,
    expiresInMinutes,
  }: {
    userId: number;
    typeId: VerificationCodeTypeId;
    expiresInMinutes: number;
  }) {
    const code = generateOtpCode();
    const hashedCode = await hash(code);
    const expiresAt = dayUTC().add(expiresInMinutes, 'minutes');

    let verificationCode = await this.verificationCodeRepository.findOne({
      where: { userId, typeId },
    });
    if (verificationCode) {
      verificationCode.code = hashedCode;
      verificationCode.expiresAt = expiresAt;
    } else {
      verificationCode = new VerificationCode({
        code: hashedCode,
        expiresAt,
        userId,
        typeId,
      });
    }
    await this.verificationCodeRepository.save(verificationCode);

    return code;
  }

  async generateAndSendEmailVerificationCode({
    userId,
    email,
    fullName,
  }: {
    userId: number;
    email: string;
    fullName: string;
  }) {
    const verifyEmailCodeExpiresInMinutes = Number(
      await this.configService.getValue(
        ConfigKey.VERIFY_EMAIL_CODE_EXPIRES_IN_MINUTES,
      ),
    );
    const verifyEmailCode = await this.generateVerificationCode({
      userId,
      typeId: VerificationCodeTypeId.VERIFY_EMAIL,
      expiresInMinutes: verifyEmailCodeExpiresInMinutes,
    });

    await this.mailService.sendEmailVerification({
      to: email,
      name: fullName,
      verificationCode: verifyEmailCode,
      expiresInMinutes: verifyEmailCodeExpiresInMinutes,
    });
  }

  async changePassword({
    userId,
    currentPassword,
    newPassword,
  }: ChangePasswordDto & { userId: number }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('Tài khoản không tồn tại');
    }

    const isCurrentPasswordValid = await verifyHash(
      user.password,
      currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không chính xác');
    }

    const hashedNewPassword = await hash(newPassword);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);
  }

  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      return;
    }

    const resetPasswordCodeExpiresInMinutes = Number(
      await this.configService.getValue(
        ConfigKey.RESET_PASSWORD_CODE_EXPIRES_IN_MINUTES,
      ),
    );
    const resetPasswordCode = await this.generateVerificationCode({
      userId: user.id,
      typeId: VerificationCodeTypeId.RESET_PASSWORD,
      expiresInMinutes: resetPasswordCodeExpiresInMinutes,
    });

    await this.mailService.sendForgotPassword({
      to: email,
      name: user.fullName,
      resetCode: resetPasswordCode,
      expiresInMinutes: resetPasswordCodeExpiresInMinutes,
    });
  }

  async resetPassword({ email, code, password }: ResetPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) {
      return;
    }

    await this.verifyCode({
      userId: user.id,
      code,
      typeId: VerificationCodeTypeId.RESET_PASSWORD,
    });

    const hashedNewPassword = await hash(password);
    user.password = hashedNewPassword;
    await this.userRepository.save(user);
  }
}
