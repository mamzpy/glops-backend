import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DeviceLoginDto } from './dto/device-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('device/login')
  @HttpCode(HttpStatus.OK)
  async loginDevice(
    @Body() dto: DeviceLoginDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.loginDevice(dto);
  }
}
