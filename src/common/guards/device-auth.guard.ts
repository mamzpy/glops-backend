import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { DeviceJwtPayload } from '../../modules/auth/types/device-jwt-payload.type';
import { RequestWithDevice } from '../../modules/auth/types/request-with-device.type';


@Injectable()
export class DeviceAuthGuard implements CanActivate {
  private readonly logger = new Logger(DeviceAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithDevice>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const payload = this.jwtService.verify<DeviceJwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('auth.jwtSecret'),
      });

      request.device = payload;
      return true;
    } catch {
      this.logger.warn('Invalid or expired device token');
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : undefined;
  }
}