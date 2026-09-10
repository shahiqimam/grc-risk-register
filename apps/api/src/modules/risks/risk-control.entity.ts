import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Control } from '../controls/control.entity';
import { Risk } from './risk.entity';

@Entity('risk_controls')
@Unique(['risk', 'control'])
export class RiskControl {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Risk, (risk) => risk.controlLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'risk_id' })
  risk!: Risk;

  @ManyToOne(() => Control, (control) => control.riskLinks, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'control_id' })
  control!: Control;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
