import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RiskAsset } from '../risks/risk-asset.entity';
import { AssetCriticality, AssetStatus, AssetType } from './asset.enums';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ length: 160 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'asset_type', type: 'enum', enum: AssetType })
  assetType!: AssetType;

  @Column({ type: 'enum', enum: AssetCriticality })
  criticality!: AssetCriticality;

  @Column({ length: 120 })
  owner!: string;

  @Column({ type: 'enum', enum: AssetStatus, default: AssetStatus.ACTIVE })
  status!: AssetStatus;

  @OneToMany(() => RiskAsset, (riskAsset) => riskAsset.asset)
  riskLinks!: RiskAsset[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
