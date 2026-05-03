import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class DeviceLoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  deviceId!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  secret!: string;
}
