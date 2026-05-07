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

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  images: string[];

  @Column({ length: 500, nullable: true })
  voiceText: string;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: 0 })
  commentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  author: User;

  @Column({ type: 'text' })
  content: string;

  @Column({ length: 500, nullable: true })
  voiceText: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('post_likes')
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @ManyToOne(() => Post)
  @JoinColumn({ name: 'postId' })
  post: Post;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
