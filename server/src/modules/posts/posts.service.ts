import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { Comment } from '../../entities/post.entity';
import { PostLike } from '../../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryPostsDto } from './dto/query-posts.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(PostLike)
    private postLikeRepository: Repository<PostLike>,
  ) {}

  /**
   * 获取帖子列表
   */
  async findAll(query: QueryPostsDto, userId?: string) {
    const { page = 1, pageSize = 10 } = query;

    const [list, total] = await this.postRepository.findAndCount({
      relations: ['author'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 获取用户点赞状态
    const postsWithLikeStatus = await Promise.all(
      list.map(async (post) => {
        let isLiked = false;
        if (userId) {
          const like = await this.postLikeRepository.findOne({
            where: { postId: post.id, userId },
          });
          isLiked = !!like;
        }
        return {
          ...post,
          isLiked,
        };
      }),
    );

    return { list: postsWithLikeStatus, total, page, pageSize };
  }

  /**
   * 获取帖子详情
   */
  async findOne(id: string, userId?: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    let isLiked = false;
    if (userId) {
      const like = await this.postLikeRepository.findOne({
        where: { postId: id, userId },
      });
      isLiked = !!like;
    }

    return { ...post, isLiked };
  }

  /**
   * 发布帖子
   */
  async create(userId: string, dto: CreatePostDto) {
    const post = this.postRepository.create({
      ...dto,
      userId,
    });

    await this.postRepository.save(post);
    this.logger.log(`用户 ${userId} 发布了帖子 ${post.id}`);

    return { id: post.id };
  }

  /**
   * 删除帖子
   */
  async remove(id: string, userId: string) {
    const post = await this.postRepository.findOne({ where: { id } });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    if (post.userId !== userId) {
      throw new ForbiddenException('无权删除此帖子');
    }

    await this.postRepository.remove(post);
    return { success: true };
  }

  /**
   * 点赞帖子
   */
  async like(postId: string, userId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const existing = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });

    if (existing) {
      return { liked: true, likeCount: post.likeCount };
    }

    const like = this.postLikeRepository.create({ postId, userId });
    await this.postLikeRepository.save(like);

    post.likeCount += 1;
    await this.postRepository.save(post);

    this.logger.log(`用户 ${userId} 点赞了帖子 ${postId}`);

    return { liked: true, likeCount: post.likeCount };
  }

  /**
   * 取消点赞
   */
  async unlike(postId: string, userId: string) {
    const like = await this.postLikeRepository.findOne({
      where: { postId, userId },
    });

    if (!like) {
      return { liked: false, likeCount: 0 };
    }

    const post = await this.postRepository.findOne({ where: { id: postId } });

    await this.postLikeRepository.remove(like);

    if (post && post.likeCount > 0) {
      post.likeCount -= 1;
      await this.postRepository.save(post);
    }

    this.logger.log(`用户 ${userId} 取消点赞了帖子 ${postId}`);

    return { liked: false, likeCount: post?.likeCount || 0 };
  }

  /**
   * 获取评论列表
   */
  async getComments(postId: string) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const comments = await this.commentRepository.find({
      where: { postId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      voiceText: c.voiceText,
      author: {
        id: c.author.id,
        nickname: c.author.nickname,
        avatar: c.author.avatar,
      },
      createdAt: c.createdAt,
    }));
  }

  /**
   * 评论帖子
   */
  async createComment(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    if (!post) {
      throw new NotFoundException('帖子不存在');
    }

    const comment = this.commentRepository.create({
      ...dto,
      postId,
      userId,
    });

    await this.commentRepository.save(comment);

    post.commentCount += 1;
    await this.postRepository.save(post);

    this.logger.log(`用户 ${userId} 评论了帖子 ${postId}`);

    return { id: comment.id };
  }

  /**
   * 删除评论
   */
  async removeComment(postId: string, commentId: string, userId: string) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId, postId },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException('无权删除此评论');
    }

    await this.commentRepository.remove(comment);

    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (post && post.commentCount > 0) {
      post.commentCount -= 1;
      await this.postRepository.save(post);
    }

    return { success: true };
  }

  /**
   * 获取用户点赞的帖子
   */
  async getUserLikes(userId: string) {
    const likes = await this.postLikeRepository.find({
      where: { userId },
      relations: ['post', 'post.author'],
      order: { createdAt: 'DESC' },
    });

    return likes
      .filter((like) => like.post)
      .map((like) => ({
        id: like.post.id,
        content: like.post.content,
        images: like.post.images,
        voiceText: like.post.voiceText,
        author: {
          id: like.post.author.id,
          nickname: like.post.author.nickname,
          avatar: like.post.author.avatar,
        },
        likeCount: like.post.likeCount,
        commentCount: like.post.commentCount,
        isLiked: true,
        likedAt: like.createdAt,
      }));
  }

  /**
   * 获取用户发布的帖子
   */
  async getUserPosts(userId: string) {
    const posts = await this.postRepository.find({
      where: { userId },
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });

    return posts.map((post) => ({
      ...post,
      isLiked: false, // 需要查询
    }));
  }
}
