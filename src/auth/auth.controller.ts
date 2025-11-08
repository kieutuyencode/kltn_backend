import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Put,
  Req,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotDto } from './dto/forgot-password.dto';
import { ResetDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SkipAuth } from '~/security';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  // --- Register ---
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const user = await this.auth.register(dto);
      return {
        success: true,
        message: 'User registered successfully!',
        data: user,
      };
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.message || 'Registration failed!' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const result = await this.auth.login(dto.email, dto.password);
      return {
        success: true,
        message: 'Login successful!',
        data: result,
      };
    } catch (err) {
      throw new HttpException(
        {
          success: false,
          message: err.message || 'Invalid email or password!',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // --- Forgot password ---
  @Post('forgot')
  async forgot(@Body() dto: ForgotDto) {
    try {
      await this.auth.forgotPassword(dto.email);
      return {
        success: true,
        message: 'Password reset email sent successfully!',
      };
    } catch (err) {
      throw new HttpException(
        {
          success: false,
          message: err.message || 'Failed to send reset email!',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // --- Reset password ---
  @Post('reset')
  async reset(@Body() dto: ResetDto) {
    try {
      await this.auth.resetPassword(dto.token, dto.newPassword);
      return {
        success: true,
        message: 'Password has been reset successfully!',
      };
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.message || 'Invalid or expired token!' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // --- Get profile ---
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async profile(@Req() req: any) {
    try {
      const profile = await this.auth.getProfile(req.user.id);
      return {
        success: true,
        message: 'Profile retrieved successfully!',
        data: profile,
      };
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.message || 'Failed to get profile!' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // --- Update profile ---
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Req() req: any, @Body() body: Partial<any>) {
    try {
      const updated = await this.auth.updateProfile(req.user.id, body);
      return {
        success: true,
        message: 'Profile updated successfully!',
        data: updated,
      };
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.message || 'Profile update failed!' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // --- Change password ---
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    try {
      await this.auth.changePassword(
        req.user.id,
        dto.oldPassword,
        dto.newPassword,
      );
      return {
        success: true,
        message: 'Password changed successfully!',
      };
    } catch (err) {
      throw new HttpException(
        { success: false, message: err.message || 'Password change failed!' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
