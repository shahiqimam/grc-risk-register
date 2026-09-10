import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { RiskControl } from '../risks/risk-control.entity';
import { ControlStatus } from './control.enums';

@Entity('controls')
export class Control {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'control_code', length: 30 })
  controlCode!: string;

  @Index()
  @Column({ length: 160 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Index()
  @Column({ length: 80 })
  category!: string;

  @Column({ type: 'int' })
  effectiveness!: number;

  @Column({ type: 'enum', enum: ControlStatus, default: ControlStatus.PLANNED })
  status!: ControlStatus;

  @Column({ length: 120 })
  owner!: string;

  @OneToMany(() => RiskControl, (riskControl) => riskControl.control)
  riskLinks!: RiskControl[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
