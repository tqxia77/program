import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 100 })
  openid: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: ['elder', 'child'], default: 'elder' })
  role: 'elder' | 'child';

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'json', nullable: true })
  notificationSettings: {
    smsEnabled: boolean;
    callEnabled: boolean;
    activityReminder: boolean;
    commentReminder: boolean;
    likeReminder: boolean;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
