import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { ControlStatus } from '../control.enums';

export class CreateControlDto {
  @IsString()
  @MaxLength(30)
  controlCode!: string;

  @IsString()
  @MaxLength(160)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @MaxLength(80)
  category!: string;

  @IsInt()
  @Min(0)
  @Max(100)
  effectiveness!: number;

  @IsOptional()
  @IsEnum(ControlStatus)
  status?: ControlStatus;

  @IsString()
  @MaxLength(120)
  owner!: string;
}
