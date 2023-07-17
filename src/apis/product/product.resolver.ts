import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Product } from './entites/product.entity';
import { ProductService } from './product.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { FetchProductOutput } from './dto/fetch-product.output';
import { FetchSubCategoryOutput } from './dto/fetch-subCategory.output';
import { FetchSearchProductOutput } from './dto/fetch-SearchProduct.output';
import { FetchLikeCategoryOutput } from './dto/fetch-LikeCategory.output';
import { FetchLikeSubCategoryOutput } from './dto/fetch-LikeSubCategory.output';

@Resolver()
export class ProductResolver {
  constructor(private readonly productsService: ProductService) {}

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Product)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @Context() context: IContext,
  ): Promise<Product> {
    return this.productsService.create({
      createProductInput,
      user_id: context.req.user.user_id,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  updateProduct(
    @Args('product_id') product_id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<boolean> {
    return this.productsService.update({ product_id, updateProductInput });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  deleteLoginProduct(
    @Args('product_id') product_id: string,
    @Context() context: IContext,
  ): Promise<boolean> {
    return this.productsService.delete({
      product_id,
      user_id: context.req.user.user_id,
    });
  }

  @Query(() => [FetchProductOutput])
  fetchProducts(
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchProductOutput[]> {
    return this.productsService.findAll({ page, pageSize });
  }

  @Query(() => [FetchProductOutput])
  fetchAllProducts(): Promise<FetchProductOutput[]> {
    return this.productsService.findAllProduct();
  }

  @Query(() => [FetchProductOutput])
  fetchRandomProduct(): Promise<FetchProductOutput[]> {
    return this.productsService.findRandom();
  }

  @Query(() => [FetchProductOutput])
  fetchSellProduct(): Promise<FetchProductOutput[]> {
    return this.productsService.findSell();
  }

  @Query(() => [FetchSearchProductOutput])
  fetchSearchProduct(
    @Args('search') search: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchSearchProductOutput[]> {
    return this.productsService.findSearch({ search, page, pageSize });
  }

  @Query(() => [FetchProductOutput])
  fetchCategoryProduct(
    @Args('product_category') product_category: string, //
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchProductOutput[]> {
    return this.productsService.findCategory({
      product_category,
      page,
      pageSize,
    });
  }

  @Query(() => [FetchLikeCategoryOutput])
  fetchLikeCategoryProduct(
    @Args('product_category') product_category: string, //
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchLikeCategoryOutput[]> {
    return this.productsService.findLikeCategory({
      product_category,
      page,
      pageSize,
    });
  }

  @Query(() => [FetchSubCategoryOutput])
  fetchSubCategoryProduct(
    @Args('product_sub_category') product_sub_category: string, //
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchSubCategoryOutput[]> {
    return this.productsService.findSubCategory({
      product_sub_category,
      page,
      pageSize,
    });
  }

  @Query(() => [FetchLikeSubCategoryOutput])
  fetchLikeSubCategoryProduct(
    @Args('product_sub_category') product_sub_category: string, //
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchLikeSubCategoryOutput[]> {
    return this.productsService.findLikeSubCategory({
      product_sub_category,
      page,
      pageSize,
    });
  }

  @Query(() => [FetchProductOutput])
  fetchSellCategoryProducts(
    @Args('product_category') product_category: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchProductOutput[]> {
    return this.productsService.findSellProduct({
      product_category,
      page,
      pageSize,
    });
  }

  @Query(() => [FetchProductOutput])
  async fetchNewbieProduct(): Promise<FetchProductOutput[]> {
    return await this.productsService.findNewUser();
  }

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => Product)
  async fetchDetailProduct(
    @Args('product_id') product_id: string,
  ): Promise<Product> {
    return this.productsService.findOne({
      product_id,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Product])
  async fetchMyProduct(
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Context() context: IContext,
  ): Promise<Product[]> {
    const user_id = context.req.user.user_id;
    return this.productsService.findUserAll({
      user_id,
      page,
      pageSize,
    });
  }

  // 나의 상단노출권 적용 안된 상품 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [Product])
  async fetchMyNotCouponProduct(
    @Context() context: IContext,
  ): Promise<Product[]> {
    const user_id = context.req.user.user_id;
    return this.productsService.fetchMyNotCouponProduct({
      user_id,
    });
  }
}
