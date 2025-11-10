import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(6).max(50),
  fullName: z.string().trim().min(1).max(50),
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(6).max(50),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().trim().min(6).max(50),
  code: z.string().trim().length(6),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  code: z.string().trim().length(6),
});

export const resendVerifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().trim().min(6).max(50),
  newPassword: z.string().trim().min(6).max(50),
});
