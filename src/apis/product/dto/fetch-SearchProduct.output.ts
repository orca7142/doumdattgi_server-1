import { Field, ObjectType } from '@nestjs/graphql';
import { FetchLikeCategoryOutput } from './fetch-LikeCategory.output';

@ObjectType()
export class FetchSearchProductOutput extends FetchLikeCategoryOutput {
  @Field(() => String, { nullable: true })
  product_product_summary: string;
}
