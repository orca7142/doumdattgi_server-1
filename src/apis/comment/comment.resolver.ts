import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CommentsService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { IContext } from 'src/commons/interfaces/context';
import { Comment } from './entities/comment.entity';

@Resolver()
export class CommentResolver {
  constructor(private readonly commentsService: CommentsService) {}

  // 댓글 생성 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ): Promise<boolean> {
    return this.commentsService.createComment({
      createCommentInput,
    });
  }

  // 댓글 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Comment])
  async fetchComments(
    @Args('request_id') request_id: string,
    @Context() context: IContext,
  ): Promise<Comment[]> {
    return this.commentsService.findComments({
      request_id,
      user_id: context.req.user.user_id,
    });
  }
}
