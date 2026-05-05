import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DeviceLoginDto } from './dto/device-login.dto';
import { DeviceLoginResponse } from './types/device-login-response.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('device/login')
  @HttpCode(HttpStatus.OK)
  async loginDevice(@Body() dto: DeviceLoginDto): Promise<DeviceLoginResponse> {
    return this.authService.loginDevice(dto);
  }
}
