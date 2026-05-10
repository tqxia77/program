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

@Entity('follows')
@Unique(['followerId', 'followingId'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  followerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followerId' })
  follower: User;

  @Column()
  followingId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'followingId' })
  following: User;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('friend_requests')
export class FriendRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @Column()
  toUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'toUserId' })
  toUser: User;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'accepted' | 'rejected';

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('friends')
@Unique(['userId', 'friendId'])
export class Friend {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  friendId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'friendId' })
  friend: User;

  @CreateDateColumn()
  createdAt: Date;
}
