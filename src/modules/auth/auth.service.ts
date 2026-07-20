import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomUUID } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { JwtPayload } from './jwt.strategy';
import { ChangePasswordDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async loadUserWithPermissions(where: { id?: string; email?: string }) {
    return this.prisma.user.findFirst({
      where: { ...where, deletedAt: null },
      include: {
        role: {
          include: { rolePermissions: { include: { permission: true } } },
        },
        clinic: { select: { id: true, name: true, code: true, isActive: true } },
        doctorProfile: true,
      },
    });
  }

  private buildPayload(
    user: NonNullable<Awaited<ReturnType<AuthService['loadUserWithPermissions']>>>,
  ): JwtPayload {
    return {
      sub: user.id,
      email: user.email,
      clinicId: user.clinicId,
      role: user.role.code,
      permissions: user.role.rolePermissions.map((rp) => rp.permission.code),
    };
  }

  private async issueTokens(payload: JwtPayload) {
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = await this.jwt.signAsync(
      { sub: payload.sub, jti: randomUUID() },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d') as `${number}d`,
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.prisma.refreshToken.create({
      data: {
        userId: payload.sub,
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto, ip?: string) {
    // Emails are stored lowercase — normalize so "Dr.Ali@x.com" logs in too
    const user = await this.loadUserWithPermissions({
      email: dto.email.trim().toLowerCase(),
    });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (user.clinic && !user.clinic.isActive) {
      throw new UnauthorizedException('Clinic is deactivated');
    }
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = this.buildPayload(user);
    const tokens = await this.issueTokens(payload);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.prisma.activityLog.create({
      data: {
        clinicId: user.clinicId,
        userId: user.id,
        action: 'LOGIN',
        ip,
      },
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role.code,
        clinic: user.clinic,
        permissions: payload.permissions,
        doctorProfile: user.doctorProfile,
      },
    };
  }

  async refresh(refreshToken: string) {
    let decoded: { sub: string };
    try {
      decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashToken(refreshToken) },
    });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired or revoked');
    }

    const user = await this.loadUserWithPermissions({ id: decoded.sub });
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('User is inactive');
    }

    // Rotate: revoke old token, issue a new pair
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });
    return this.issueTokens(this.buildPayload(user));
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.refreshToken.updateMany({
        where: { userId, tokenHash: this.hashToken(refreshToken) },
        data: { revokedAt: new Date() },
      });
    } else {
      await this.prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true };
  }

  async me(user: AuthenticatedUser) {
    const full = await this.loadUserWithPermissions({ id: user.id });
    if (!full) throw new UnauthorizedException();
    return {
      id: full.id,
      fullName: full.fullName,
      email: full.email,
      phone: full.phone,
      role: full.role.code,
      clinic: full.clinic,
      permissions: full.role.rolePermissions.map((rp) => rp.permission.code),
      doctorProfile: full.doctorProfile,
    };
  }

  async changePassword(user: AuthenticatedUser, dto: ChangePasswordDto) {
    const dbUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
    });
    const valid = await bcrypt.compare(dto.currentPassword, dbUser.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password incorrect');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await bcrypt.hash(dto.newPassword, 10) },
    });
    // Force re-login everywhere
    await this.prisma.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }
}
