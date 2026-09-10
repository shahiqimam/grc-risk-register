import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { AssetCriticality, AssetStatus, AssetType } from '../asset.enums';

export class CreateAssetDto {
  @IsString()
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsEnum(AssetType)
  assetType!: AssetType;

  @IsEnum(AssetCriticality)
  criticality!: AssetCriticality;

  @IsString()
  @MaxLength(120)
  owner!: string;

  @IsOptional()
  @IsEnum(AssetStatus)
  status?: AssetStatus;
}
