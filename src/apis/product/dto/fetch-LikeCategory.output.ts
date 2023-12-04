import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FetchLikeCategoryOutput {
  @Field(() => String)
  product_product_id: string;

  @Field(() => String)
  product_product_title: string;

  @Field(() => String)
  product_product_category: string;

  @Field(() => String)
  product_product_sub_category: string;

  @Field(() => String)
  product_product_workDay: string;

  @Field(() => Boolean)
  product_product_sellOrBuy: boolean;

  @Field(() => String)
  u_user_nickname: string;

  @Field(() => String, { nullable: true })
  u_user_profileImage: string;

  @Field(() => String)
  image_url: string;

  @Field(() => Number)
  pick_count: number;
}
