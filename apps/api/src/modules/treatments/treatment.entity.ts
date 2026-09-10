import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Risk } from '../risks/risk.entity';
import { TreatmentStatus, TreatmentStrategy } from './treatment.enums';

@Entity('treatments')
export class Treatment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'risk_id', type: 'uuid' })
  riskId!: string;

  @ManyToOne(() => Risk, (risk) => risk.treatments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'risk_id' })
  risk!: Risk;

  @Column({ type: 'enum', enum: TreatmentStrategy })
  strategy!: TreatmentStrategy;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 120 })
  owner!: string;

  @Column({ name: 'target_date', type: 'date' })
  targetDate!: string;

  @Column({ type: 'enum', enum: TreatmentStatus, default: TreatmentStatus.PLANNED })
  status!: TreatmentStatus;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
