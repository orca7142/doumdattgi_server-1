import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { CouponsService } from './coupon.service';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { Coupon } from './entities/coupon.entity';

@Resolver()
export class CouponsResolver {
  constructor(
    private readonly couponsService: CouponsService, //
  ) {}

  // 쿠폰 구매 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Coupon)
  purchaseCoupon(
    @Args('coupon') coupon: string,
    @Context() context: IContext, //
  ): Promise<Coupon> {
    return this.couponsService.purchaseCoupon({ context, coupon });
  }
}
