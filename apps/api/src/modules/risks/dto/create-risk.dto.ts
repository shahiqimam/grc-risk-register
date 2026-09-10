import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';
import { RiskCategory, RiskStatus } from '../risk.enums';

export class CreateRiskDto {
  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(4000)
  description!: string;

  @IsEnum(RiskCategory)
  category!: RiskCategory;

  @IsInt()
  @Min(1)
  @Max(5)
  likelihood!: number;

  @IsInt()
  @Min(1)
  @Max(5)
  impact!: number;

  @IsUUID()
  ownerId!: string;

  @IsOptional()
  @IsEnum(RiskStatus)
  status?: RiskStatus;

  @IsDateString()
  reviewDate!: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  linkedAssets?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  linkedControls?: string[];
}
