import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Product } from './entites/product.entity';
import { ProductService } from './product.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { FetchProductOutput } from './dto/fetch-product.output';
import { FetchSubCategoryOutput } from './dto/fetch-subCategoty.output';
import { FetchSearchProductOutput } from './dto/fetch-SearchProduct.output';

@Resolver()
export class ProductResolver {
  constructor(private readonly productsService: ProductService) {}

  // 게시글 작성으로 상품생성 API
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

  // 상품 수정하기 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  updateProduct(
    @Args('product_id') product_id: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<boolean> {
    return this.productsService.update({ product_id, updateProductInput });
  }

  // 상품 수정 & 업데이트 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  deleteLoginProduct(@Args('product_id') product_id: string): Promise<boolean> {
    return this.productsService.delete({ product_id });
  }

  // 전체상품 검색 API
  @Query(() => [FetchProductOutput])
  fetchProducts(
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchProductOutput[]> {
    return this.productsService.findAll({ page, pageSize });
  }

  // 최신 게시물 검색 API
  @Query(() => [FetchProductOutput])
  fetchAllProducts(): Promise<FetchProductOutput[]> {
    return this.productsService.findAllProduct();
  }

  // 랜덤 게시물 검색 API
  @Query(() => [FetchProductOutput])
  fetchRandomProduct(): Promise<FetchProductOutput[]> {
    return this.productsService.findRandom();
  }

  // 메인페이지 구인글 검색 API
  @Query(() => [FetchProductOutput])
  fetchSellProduct(): Promise<FetchProductOutput[]> {
    return this.productsService.findSell();
  }

  // 검색 API
  @Query(() => [FetchSearchProductOutput])
  fetchSearchProduct(
    @Args('search') search: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchSearchProductOutput[]> {
    return this.productsService.findSearch({ search, page, pageSize });
  }

  // 카테고리로 상품검색 API
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

  // 서브 카테고리 상품검색 API
  @Query(() => [FetchSubCategoryOutput])
  fetchSubCategoryProduct(
    @Args('product_category') product_category: string, //
    @Args('product_sub_category') product_sub_category: string, //
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchSubCategoryOutput[]> {
    return this.productsService.findSubCategory({
      product_category,
      product_sub_category,
      page,
      pageSize,
    });
  }

  // 구해요 카테고리만 검색 API
  @Query(() => [FetchProductOutput])
  fetchSellCategoryProducts(
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<FetchProductOutput[]> {
    return this.productsService.findSellProduct({ page, pageSize });
  }

  // 신규유저의 상품 검색 API
  @Query(() => [FetchProductOutput])
  async fetchNewbieProduct(): Promise<FetchProductOutput[]> {
    return await this.productsService.findNewUser();
  }

  // 상품의 디테일페이지 검색 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => Product)
  async fetchDetailProduct(
    @Args('product_id') product_id: string,
  ): Promise<Product> {
    return this.productsService.findOne({
      product_id,
    });
  }

  // 나의 상품들 검색 API
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
}
