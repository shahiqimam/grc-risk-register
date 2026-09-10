import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TreatmentStatus, TreatmentStrategy } from '../treatment.enums';

export class CreateTreatmentDto {
  @IsEnum(TreatmentStrategy)
  strategy!: TreatmentStrategy;

  @IsString()
  @MaxLength(3000)
  description!: string;

  @IsString()
  @MaxLength(120)
  owner!: string;

  @IsDateString()
  targetDate!: string;

  @IsOptional()
  @IsEnum(TreatmentStatus)
  status?: TreatmentStatus;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  notes?: string;
}
