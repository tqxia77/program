import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum ActivityCategory {
  HEALTH = 'health',
  EDUCATION = 'education',
  SOCIAL = 'social',
  VOLUNTEER = 'volunteer',
}

export enum ActivityStatus {
  PENDING = 'pending',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  title: string;

  @Column({ type: 'enum', enum: ActivityCategory })
  category: ActivityCategory;

  @Column({ length: 255, nullable: true })
  coverImage: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column({ length: 100 })
  location: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ default: 0 })
  capacity: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ActivityStatus, default: ActivityStatus.PENDING })
  status: ActivityStatus;

  @Column()
  organizerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'organizerId' })
  organizer: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
