import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateRequestInput } from './dto/create-request.input';
import { RequestsService } from './request.service';
import { IContext } from 'src/commons/interfaces/context';
import { Request } from './entites/request.entity';

@Resolver()
export class RequestsResolver {
  constructor(private readonly requestsService: RequestsService) {}

  // 의뢰 요청하기 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Request)
  sendRequest(
    @Args('createRequestInput') createRequestInput: CreateRequestInput,
    @Context() context: IContext, //
  ): Promise<Request> {
    return this.requestsService.sendRequest({
      createRequestInput,
      context,
    });
  }

  // 신청 내역 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Request])
  fetchRequest(
    @Context() context: IContext, //
  ): Promise<Request[]> {
    return this.requestsService.fetchRequest({
      context,
    });
  }

  // 작업 진행 내역 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Request])
  fetchWork(
    @Context() context: IContext, //
  ): Promise<Request[]> {
    return this.requestsService.fetchWork({
      context,
    });
  }
}
