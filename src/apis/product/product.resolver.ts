import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Product } from './entites/product.entity';
import { ProductService } from './product.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';
import { FetchProductOutput } from './dto/fetch-productNewUser.output';

@Resolver()
export class ProductResolver {
  constructor(private readonly productsService: ProductService) {}

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Product)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @Context() context: IContext,
  ) {
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
  deleteLoginProduct(@Args('product_id') product_id: string): Promise<boolean> {
    return this.productsService.delete({ product_id });
  }

  @Query(() => [Product])
  fetchProducts(
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Product[]> {
    return this.productsService.findAll({ page, pageSize });
  }

  @Query(() => [Product])
  fetchRandomProduct(): Promise<Product[]> {
    return this.productsService.findRandom();
  }

  @Query(() => [Product])
  fetchCategoryProduct(
    @Args('product_category') product_category: string, //
  ): Promise<Product[]> {
    return this.productsService.findCategory({ product_category });
  }

  @Query(() => [FetchProductOutput])
  async fetchNewbieProduct(): Promise<FetchProductOutput[]> {
    return await this.productsService.findNewUser();
  }
}
