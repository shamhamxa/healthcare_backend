import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';

export interface JwtPayload {
  sub: string;
  email: string;
  clinicId: string | null;
  role: string;
  permissions: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, status: 'ACTIVE', deletedAt: null },
      select: { id: true, fullName: true, branchId: true },
    });
    if (!user) throw new UnauthorizedException('User is inactive or removed');

    return {
      id: payload.sub,
      email: payload.email,
      fullName: user.fullName,
      clinicId: payload.clinicId,
      branchId: user.branchId,
      roleCode: payload.role,
      permissions: payload.permissions ?? [],
    };
  }
}
