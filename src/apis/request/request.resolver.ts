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

  // 신청 내역 전체 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Request])
  fetchBuyerRequest(
    @Context() context: IContext, //
  ): Promise<Request[]> {
    return this.requestsService.fetchBuyerRequest({
      context,
    });
  }

  // 특정 신청 내역 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => Request)
  fetchOneRequest(
    @Args('request_id') request_id: string, //
  ): Promise<Request> {
    return this.requestsService.fetchOneRequest({
      request_id,
    });
  }

  // 작업 진행 내역 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Request])
  fetchSellerWork(
    @Context() context: IContext, //
  ): Promise<Request[]> {
    return this.requestsService.fetchSellerWork({
      context,
    });
  }

  // 의뢰 수락 / 거절 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Request)
  requestAcceptRefuse(
    @Args('acceptRefuse') acceptRefuse: string,
    @Args('request_id') request_id: string, //
  ): Promise<Request> {
    return this.requestsService.requestAcceptRefuse({
      acceptRefuse,
      request_id,
    });
  }

  // 프로세스 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  requestStart(
    @Args('process') process: string,
    @Args('request_id') request_id: string, //
  ): Promise<boolean> {
    return this.requestsService.requestStart({
      process,
      request_id,
    });
  }
}
