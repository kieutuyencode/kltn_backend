import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SkipAuth } from '~/security';
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resendVerifyEmailSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from './schemas';
import { Result, SchemaValidationPipe } from '~/shared';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResendVerifyEmailDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyEmailDto,
} from './dtos';
import { UserAuth, UserPayload } from '../decorators';
import { TUserPayload } from '../types';

@Controller('user/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('sign-up')
  async signUp(@Body(new SchemaValidationPipe(signUpSchema)) body: SignUpDto) {
    return Result.success({
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
      data: await this.authService.signUp(body),
    });
  }

  @SkipAuth()
  @Post('sign-in')
  async signIn(@Body(new SchemaValidationPipe(signInSchema)) body: SignInDto) {
    return Result.success({
      message: 'Đăng nhập thành công',
      data: await this.authService.signIn(body),
    });
  }

  @SkipAuth()
  @Post('verify-email')
  async verifyEmail(
    @Body(new SchemaValidationPipe(verifyEmailSchema)) body: VerifyEmailDto,
  ) {
    return Result.success({
      message: 'Email đã được xác thực thành công',
      data: await this.authService.verifyEmail(body),
    });
  }

  @SkipAuth()
  @Post('resend-verify-email')
  async resendVerifyEmail(
    @Body(new SchemaValidationPipe(resendVerifyEmailSchema))
    body: ResendVerifyEmailDto,
  ) {
    return Result.success({
      message:
        'Mã xác thực đã được gửi đi. Vui lòng kiểm tra email để xác thực tài khoản.',
      data: await this.authService.resendVerifyEmail(body),
    });
  }

  @SkipAuth()
  @Post('forgot-password')
  async forgotPassword(
    @Body(new SchemaValidationPipe(forgotPasswordSchema))
    body: ForgotPasswordDto,
  ) {
    return Result.success({
      message:
        'Mã xác thực đã được gửi đi. Vui lòng kiểm tra email để đặt lại mật khẩu.',
      data: await this.authService.forgotPassword(body),
    });
  }

  @SkipAuth()
  @Post('reset-password')
  async resetPassword(
    @Body(new SchemaValidationPipe(resetPasswordSchema)) body: ResetPasswordDto,
  ) {
    return Result.success({
      message: 'Mật khẩu đã được đặt lại thành công',
      data: await this.authService.resetPassword(body),
    });
  }

  @UserAuth()
  @Post('change-password')
  async changePassword(
    @Body(new SchemaValidationPipe(changePasswordSchema))
    body: ChangePasswordDto,
    @UserPayload() user: TUserPayload,
  ) {
    return Result.success({
      message: 'Mật khẩu đã được thay đổi thành công',
      data: await this.authService.changePassword({ ...body, userId: user.id }),
    });
  }
}
