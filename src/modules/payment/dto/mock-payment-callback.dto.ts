import { IsBoolean, IsString } from 'class-validator';

export class MockPaymentCallbackDto {
  @IsString()
  orderId!: string;

  @IsBoolean()
  success!: boolean;
}