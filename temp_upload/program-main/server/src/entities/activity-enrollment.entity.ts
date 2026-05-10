import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Activity } from './activity.entity';

@Entity('activity_enrollments')
@Unique(['activityId', 'userId'])
export class ActivityEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  activityId: string;

  @ManyToOne(() => Activity)
  @JoinColumn({ name: 'activityId' })
  activity: Activity;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  remark: string;

  @CreateDateColumn()
  enrolledAt: Date;
}
