import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EnvironmentVariables } from '~/environment-variables';
import jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(private readonly env: EnvironmentVariables) {}

  signToken(payload: object) {
    return jwt.sign(payload, this.env.JWT_SECRET, {
      expiresIn: this.env.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.env.JWT_SECRET);
      return decoded as object;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
