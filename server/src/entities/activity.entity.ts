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

// 中文分类便于展示
export enum ActivityCategory {
  HEALTH = '健康养生',
  ENTERTAINMENT = '文艺娱乐',
  SOCIAL = '社交联谊',
  VOLUNTEER = '志愿服务',
  OTHER = '其他',
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

  @Column({ length: 50 })
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
