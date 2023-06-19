import { Field, ObjectType } from '@nestjs/graphql';
import { FetchProductOutput } from './fetch-product.output';

@ObjectType()
export class FetchLikeCategoryOutput extends FetchProductOutput {
  @Field(() => String)
  product_pick_pick_id: number;
}
