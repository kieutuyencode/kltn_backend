import { Body, Controller, Post } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { SkipAuth } from '~/security';
import { Result, SchemaValidationPipe } from '~/shared';
import { signInSchema } from './schemas';
import { SignInDto } from './dtos';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @SkipAuth()
  @Post('sign-in')
  async signIn(
    @Body(new SchemaValidationPipe(signInSchema))
    body: SignInDto,
  ) {
    return Result.success({ data: await this.walletService.signIn(body) });
  }
}
