import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Product } from './entites/product.entity';
import { ProductService } from './product.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { IContext } from 'src/commons/interfaces/context';

@Resolver()
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Product)
  createProduct(
    @Args('createProductInput') createProductInput: CreateProductInput,
    @Context() context: IContext,
  ) {
    return this.productService.create({
      createProductInput,
      user_id: context.req.user.id,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  updateProduct(
    @Args('productId') productId: string,
    @Args('updateProductInput') updateProductInput: UpdateProductInput,
  ): Promise<boolean> {
    return this.productService.update({ productId, updateProductInput });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  deleteLoginProduct(@Args('productId') productId: string): Promise<boolean> {
    return this.productService.delete({ productId });
  }

  @Query(() => [Product])
  fetchProducts(
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
  ): Promise<Product[]> {
    return this.productService.findAll({ page, pageSize });
  }

  @Query(() => [Product])
  fetchRandomProduct(): Promise<Product[]> {
    return this.productService.findRandom();
  }

  @Query(() => [Product])
  fetchCategoryProduct(
    @Args('category') category: string, //
  ): Promise<Product[]> {
    return this.productService.findCategory({ category });
  }

  @Query(() => [Product])
  fetchNewbieProduct(): Promise<Product[]> {
    return this.productService.findNewUser();
  }
}
