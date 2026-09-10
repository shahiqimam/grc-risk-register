import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { RiskCategory, RiskRating, RiskStatus } from '../risk.enums';

export class RiskQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RiskCategory)
  category?: RiskCategory;

  @IsOptional()
  @IsEnum(RiskStatus)
  status?: RiskStatus;

  @IsOptional()
  @IsUUID()
  owner?: string;

  @IsOptional()
  @IsEnum(RiskRating)
  inherentRating?: RiskRating;

  @IsOptional()
  @IsEnum(RiskRating)
  residualRating?: RiskRating;

  @IsOptional()
  @IsUUID()
  assetId?: string;

  @IsOptional()
  @IsUUID()
  controlId?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  reviewDue?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value ?? 1))
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value ?? 20))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  @IsOptional()
  @IsIn(['riskCode', 'title', 'category', 'status', 'reviewDate', 'residualRiskScore'])
  sortBy = 'riskCode';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  order: 'ASC' | 'DESC' | 'asc' | 'desc' = 'ASC';
}
