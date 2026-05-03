import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { DeviceStatus } from '@prisma/client';
import { DeviceLoginDto } from './dto/device-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginDevice(dto: DeviceLoginDto): Promise<{ accessToken: string }> {
    const device = await this.prisma.device.findUnique({
      where: { deviceId: dto.deviceId },
    });

    if (!device) {
      this.logger.warn('Device login failed: unknown device');
      throw new UnauthorizedException('Invalid credentials');
    }

    if (device.status !== DeviceStatus.ACTIVE) {
      this.logger.warn(
        `Device login rejected: non-active device ${device.deviceId}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const isSecretValid = await bcrypt.compare(dto.secret, device.secretHash);

    if (!isSecretValid) {
      this.logger.warn(
        `Device login failed: invalid secret for ${device.deviceId}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.device.update({
      where: { deviceId: device.deviceId },
      data: { lastSeenAt: new Date() },
    });

    const payload = {
      deviceId: device.deviceId,
      stationId: device.stationId,
      type: device.type,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
