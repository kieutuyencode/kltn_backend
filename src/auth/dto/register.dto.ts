import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty() @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsNotEmpty() @IsString()
  password: string;

  @IsOptional() @IsString()
  phone?: string;

  @IsOptional() @IsIn(['male', 'female', 'other'])
  gender?: 'male' | 'female' | 'other';

  @IsOptional() @IsString()
  avatar?: string; // base64
}
