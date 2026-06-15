import { IsArray, IsOptional, IsString, IsUrl, ArrayNotEmpty } from 'class-validator';

export class ConfirmAdImpressionDto {
  @IsOptional()
  @IsString()
  adId?: string;

  @IsOptional()
  @IsString()
  creativeId?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({ require_protocol: true }, { each: true })
  impressionUrls!: string[];
}
