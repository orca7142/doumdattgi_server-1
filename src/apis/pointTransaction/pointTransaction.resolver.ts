import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IContext } from 'src/commons/interfaces/context';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { PointTransaction } from './entities/pointTransaction.entity';
import { PointsTransactionsService } from './pointTransaction.service';

@Resolver()
export class PointsTransactionsResolver {
  constructor(
    private readonly pointsTransactionsService: PointsTransactionsService,
  ) {}

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => PointTransaction)
  createPointTransaction(
    @Args('impUid') impUid: string, //
    @Args({ name: 'amount', type: () => Int }) amount: number,
    @Args('paymentType') paymentType: string, //
    @Context() context: IContext,
  ): Promise<PointTransaction> {
    const user = context.req.user;
    return this.pointsTransactionsService.createForPayment({
      impUid,
      amount,
      user,
      paymentType,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => PointTransaction)
  cancelPointTransaction(
    @Args('impUid') impUid: string,
    @Args('paymentType') paymentType: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    return this.pointsTransactionsService.cancel({
      impUid,
      user,
      paymentType,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [PointTransaction])
  fetchPointTransactions(
    @Args('impUid') impUid: string,
    @Context() context: IContext,
  ): Promise<PointTransaction[]> {
    const user = context.req.user;
    return this.pointsTransactionsService.findByImpUidAndUser({
      impUid,
      user,
    });
  }
}
