import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { Auth } from '../../../common/decorators/auth.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ResponseUtils } from '../../../common/utils/response.util';
import { User } from '../../../entities/user.entity';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /**
   * 获取帖子列表
   * GET /api/posts
   */
  @Get()
  async findAll(
    @Query() query: QueryPostsDto,
    @CurrentUser() user?: User,
  ) {
    const result = await this.postsService.findAll(query, user?.id);
    return ResponseUtils.page(result.list, result.total, result.page, result.pageSize);
  }

  /**
   * 获取帖子详情
   * GET /api/posts/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser() user?: User,
  ) {
    const result = await this.postsService.findOne(id, user?.id);
    return ResponseUtils.success(result);
  }

  /**
   * 发布帖子
   * POST /api/posts
   */
  @Post()
  @Auth()
  async create(
    @CurrentUser() user: User,
    @Body() dto: CreatePostDto,
  ) {
    const result = await this.postsService.create(user.id, dto);
    return ResponseUtils.success(result, '发布成功');
  }

  /**
   * 删除帖子
   * DELETE /api/posts/:id
   */
  @Delete(':id')
  @Auth()
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.postsService.remove(id, user.id);
    return ResponseUtils.success(result, '删除成功');
  }

  /**
   * 点赞帖子
   * POST /api/posts/:id/like
   */
  @Post(':id/like')
  @Auth()
  async like(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.postsService.like(id, user.id);
    return ResponseUtils.success(result, '点赞成功');
  }

  /**
   * 取消点赞
   * DELETE /api/posts/:id/like
   */
  @Delete(':id/like')
  @Auth()
  async unlike(
    @Param('id') id: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.postsService.unlike(id, user.id);
    return ResponseUtils.success(result, '已取消点赞');
  }

  /**
   * 获取评论列表
   * GET /api/posts/:id/comments
   */
  @Get(':id/comments')
  async getComments(@Param('id') id: string) {
    const result = await this.postsService.getComments(id);
    return ResponseUtils.success(result);
  }

  /**
   * 评论帖子
   * POST /api/posts/:id/comments
   */
  @Post(':id/comments')
  @Auth()
  async createComment(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateCommentDto,
  ) {
    const result = await this.postsService.createComment(id, user.id, dto);
    return ResponseUtils.success(result, '评论成功');
  }

  /**
   * 删除评论
   * DELETE /api/posts/:id/comments/:cid
   */
  @Delete(':id/comments/:cid')
  @Auth()
  async removeComment(
    @Param('id') postId: string,
    @Param('cid') commentId: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.postsService.removeComment(postId, commentId, user.id);
    return ResponseUtils.success(result, '删除成功');
  }
}
