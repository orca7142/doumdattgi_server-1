import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CouponsService } from './coupon.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';

@Resolver()
export class CouponsResolver {
  constructor(
    private readonly couponsService: CouponsService, //
  ) {}

  // 쿠폰 구매 및 사용 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  purchaseCoupon(
    @Args('coupon') coupon: string,
    @Args('productId') productId: string,
    @Context() context: IContext,
  ): Promise<boolean> {
    return this.couponsService.purchaseCoupon({ context, coupon, productId });
  }
}
