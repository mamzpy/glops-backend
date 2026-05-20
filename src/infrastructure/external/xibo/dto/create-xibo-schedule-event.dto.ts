import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateXiboScheduleEventDto {
  @IsInt()
  @Min(1)
  eventTypeId!: number;

  @IsInt()
  @Min(1)
  campaignId!: number;

  @IsInt()
  @Min(0)
  displayOrder!: number;

  @IsInt()
  @Min(0)
  isPriority!: number;

  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  displayGroupIds!: number[];

  @IsOptional()
  @IsInt()
  @Min(0)
  dayPartId?: number;

  @IsString()
  fromDt!: string;

  @IsOptional()
  @IsString()
  toDt?: string;
}
