import { IsNotEmpty, IsString } from 'class-validator';

export class ResetDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
