import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Treatment } from '../treatments/treatment.entity';
import { User } from '../users/user.entity';
import { RiskAsset } from './risk-asset.entity';
import { RiskControl } from './risk-control.entity';
import { RiskHistory } from './risk-history.entity';
import { RiskCategory, RiskRating, RiskStatus } from './risk.enums';

@Entity('risks')
export class Risk {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'risk_code', length: 30 })
  riskCode!: string;

  @Index()
  @Column({ length: 180 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Index()
  @Column({ type: 'enum', enum: RiskCategory })
  category!: RiskCategory;

  @Column({ type: 'int' })
  likelihood!: number;

  @Column({ type: 'int' })
  impact!: number;

  @Column({ name: 'inherent_risk_score', type: 'int' })
  inherentRiskScore!: number;

  @Column({ name: 'inherent_risk_rating', type: 'enum', enum: RiskRating })
  inherentRiskRating!: RiskRating;

  @Column({ name: 'residual_risk_score', type: 'int' })
  residualRiskScore!: number;

  @Index()
  @Column({ name: 'residual_risk_rating', type: 'enum', enum: RiskRating })
  residualRiskRating!: RiskRating;

  @Index()
  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId!: string;

  @ManyToOne(() => User, (user) => user.ownedRisks, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'owner_id' })
  owner!: User;

  @Index()
  @Column({ type: 'enum', enum: RiskStatus, default: RiskStatus.OPEN })
  status!: RiskStatus;

  @Index()
  @Column({ name: 'review_date', type: 'date' })
  reviewDate!: string;

  @OneToMany(() => RiskAsset, (riskAsset) => riskAsset.risk, { cascade: true })
  assetLinks!: RiskAsset[];

  @OneToMany(() => RiskControl, (riskControl) => riskControl.risk, { cascade: true })
  controlLinks!: RiskControl[];

  @OneToMany(() => Treatment, (treatment) => treatment.risk)
  treatments!: Treatment[];

  @OneToMany(() => RiskHistory, (history) => history.risk)
  history!: RiskHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
