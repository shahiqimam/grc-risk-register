import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';
import { Risk } from './risk.entity';
import { RiskHistoryEventType } from './risk.enums';

@Entity('risk_history')
export class RiskHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Risk, (risk) => risk.history, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'risk_id' })
  risk!: Risk;

  @Column({ name: 'risk_id', type: 'uuid' })
  riskId!: string;

  @ManyToOne(() => User, (user) => user.historyEvents, { eager: true, onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy!: User | null;

  @Column({ name: 'changed_by_id', type: 'uuid', nullable: true })
  changedById!: string | null;

  @Column({ name: 'event_type', type: 'enum', enum: RiskHistoryEventType })
  eventType!: RiskHistoryEventType;

  @Column({ length: 240 })
  summary!: string;

  @Column({ name: 'before_state', type: 'jsonb', nullable: true })
  beforeState!: Record<string, unknown> | null;

  @Column({ name: 'after_state', type: 'jsonb', nullable: true })
  afterState!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
