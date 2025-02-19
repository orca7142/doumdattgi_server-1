import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { Mileage } from './entities/mileage.entity';
import { MileagesService } from './mileage.service';
import { Product } from '../product/entites/product.entity';

@Resolver()
export class MileagesResolver {
  constructor(
    private readonly mileagesService: MileagesService, //
  ) {}

  // 마일리지 내역 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Mileage])
  fetchMileageHistory(
    @Context() context: IContext, //
  ): Promise<Mileage[]> {
    return this.mileagesService.mileageHistory({ context });
  }

  // 마일리지 사용 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  purchaseCoupon(
    @Args('coupon') coupon: string,
    @Args('productId') productId: string,
    @Context() context: IContext,
  ): Promise<boolean> {
    return this.mileagesService.purchaseCoupon({ context, coupon, productId });
  }

  // 나의 마일리지 적용상품 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Product])
  fetchMileageProductHistory(
    @Context() context: IContext, //
  ): Promise<Product[]> {
    return this.mileagesService.mileageProductHistory({ context });
  }

  // 마일리지 적용상품 조회 API
  @Query(() => [Product])
  fetchRandomMileageProduct(
    @Args('category') category: string, //
  ): Promise<Product[]> {
    return this.mileagesService.fetchRandomMileageProduct({ category });
  }
}
