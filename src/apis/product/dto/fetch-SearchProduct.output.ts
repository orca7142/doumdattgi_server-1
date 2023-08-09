import { Field, ObjectType } from '@nestjs/graphql';
import { FetchProductOutput } from './fetch-product.output';

@ObjectType()
export class FetchSearchProductOutput extends FetchProductOutput {
  @Field(() => String, { nullable: true })
  product_product_summary: string;
}
