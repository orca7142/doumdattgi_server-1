import { Field, ObjectType } from '@nestjs/graphql';
import { FetchProductOutput } from './fetch-product.output';

@ObjectType()
export class FetchMyProductOutput extends FetchProductOutput {
  @Field(() => String)
  u_user_id: string;

  @Field(() => String)
  product_product_summary: string;
}
