import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-jwt-key-bengkel-booking-2026',
    });
  }

  async validate(payload: { sub: string; email: string; role: string; name?: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    }).catch(() => null);

    if (!user) {
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        role: payload.role || 'CUSTOMER',
      };
    }

    const { password, ...result } = user;
    return result;
  }
}
