import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Asset } from '../assets/asset.entity';
import { Risk } from './risk.entity';

@Entity('risk_assets')
@Unique(['risk', 'asset'])
export class RiskAsset {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Risk, (risk) => risk.assetLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'risk_id' })
  risk!: Risk;

  @ManyToOne(() => Asset, (asset) => asset.riskLinks, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'asset_id' })
  asset!: Asset;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
