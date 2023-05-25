import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FetchMyPickOutput {
  @Field(() => String)
  pick_pick_id: string;

  @Field(() => String)
  p_product_id: string;

  @Field(() => String)
  p_product_title: string;

  @Field(() => String)
  p_product_category: string;

  @Field(() => String)
  p_product_workDay: string;

  @Field(() => Boolean)
  p_product_sellOrBuy: boolean;

  @Field(() => String)
  p_product_summary: string;

  @Field(() => String)
  u_user_nickname: string;

  @Field(() => String, { nullable: true })
  u_user_profileImage: string;

  @Field(() => String)
  i_image_url: string;
}
