import { z } from 'zod';
import {
  forgotPasswordSchema,
  resendVerifyEmailSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
  changePasswordSchema,
} from '../schemas';

export type SignUpDto = z.infer<typeof signUpSchema>;

export type SignInDto = z.infer<typeof signInSchema>;

export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;

export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;

export type ResendVerifyEmailDto = z.infer<typeof resendVerifyEmailSchema>;

export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
