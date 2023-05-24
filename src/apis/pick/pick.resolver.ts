import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PicksService } from './pick.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { FetchMyPickOutput } from './dto/fetch-myPick.output';

@Resolver()
export class PickResolver {
  constructor(private readonly picksService: PicksService) {}

  // 찜 생성 및 삭제 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => String)
  createPick(
    @Args('product_id') product_id: string, //
    @Context() context: IContext,
  ): Promise<string> {
    return this.picksService.create({
      product_id,
      user_id: context.req.user.user_id,
    });
  }

  // 유저가 찜한 목록 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [FetchMyPickOutput])
  fetchPickUserProduct(
    @Context() context: IContext,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchMyPickOutput[]> {
    return this.picksService.fetchPickUser({
      user_id: context.req.user.user_id,
      page,
      pageSize,
    });
  }
}
