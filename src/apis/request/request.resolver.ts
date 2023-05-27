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

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Request)
  sendRequest(
    @Args('createRequestInput') createRequestInput: CreateRequestInput,
    @Context() context: IContext,
  ): Promise<Request> {
    return this.requestsService.sendRequest({
      createRequestInput,
      context,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Request])
  fetchBuyerRequest(
    @Context() context: IContext, //
  ): Promise<Request[]> {
    return this.requestsService.fetchBuyerRequest({
      context,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => Request)
  fetchOneRequest(
    @Args('request_id') request_id: string, //
  ): Promise<Request> {
    return this.requestsService.fetchOneRequest({
      request_id,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Request])
  fetchSellerWork(
    @Context() context: IContext, //
  ): Promise<Request[]> {
    return this.requestsService.fetchSellerWork({
      context,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Request)
  requestAcceptRefuse(
    @Args('acceptRefuse') acceptRefuse: string,
    @Args('request_id') request_id: string,
    @Context() context: IContext,
  ): Promise<Request> {
    return this.requestsService.requestAcceptRefuse({
      context,
      acceptRefuse,
      request_id,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  requestProcess(
    @Args('process') process: string,
    @Args('request_id') request_id: string,
  ): Promise<boolean> {
    return this.requestsService.requestProcess({
      process,
      request_id,
    });
  }
}
