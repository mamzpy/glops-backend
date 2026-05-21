import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetXiboScheduleEventsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  displayGroupId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  eventTypeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  campaignId?: number;

  @IsOptional()
  @IsString()
  fromDt?: string;

  @IsOptional()
  @IsString()
  toDt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  geoAware?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1)
  recurring?: number;
}
