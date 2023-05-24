import { Field, ObjectType } from '@nestjs/graphql';
import { FetchProductOutput } from './fetch-product.output';

@ObjectType()
export class FetchSearchProductOutput extends FetchProductOutput {
  @Field(() => String)
  product_product_summary: string;
}
