import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CommentsService } from './comment.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { Comment } from './entities/comment.entity';
import { FindCommentsOutput } from './dto/findComments.output';

@Resolver()
export class CommentResolver {
  constructor(private readonly commentsService: CommentsService) {}

  // 댓글 생성 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Comment)
  createComment(
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ): Promise<Comment> {
    return this.commentsService.createComment({
      createCommentInput,
    });
  }

  // 댓글 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [FindCommentsOutput])
  async fetchComments(
    @Args('request_id') request_id: string,
  ): Promise<FindCommentsOutput[]> {
    return this.commentsService.findComments({
      request_id,
    });
  }
}
