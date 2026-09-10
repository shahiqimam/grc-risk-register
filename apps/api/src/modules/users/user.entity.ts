import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Risk } from '../risks/risk.entity';
import { RiskHistory } from '../risks/risk-history.entity';
import { UserRole } from './user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Index({ unique: true })
  @Column({ length: 255 })
  email!: string;

  @Exclude()
  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.VIEWER })
  role!: UserRole;

  @OneToMany(() => Risk, (risk) => risk.owner)
  ownedRisks!: Risk[];

  @OneToMany(() => RiskHistory, (history) => history.changedBy)
  historyEvents!: RiskHistory[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
