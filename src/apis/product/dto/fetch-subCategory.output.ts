import { Field, ObjectType } from '@nestjs/graphql';
import { FetchProductOutput } from './fetch-product.output';

@ObjectType()
export class FetchSubCategoryOutput extends FetchProductOutput {
  @Field(() => String)
  product_product_sub_category: string;
}
