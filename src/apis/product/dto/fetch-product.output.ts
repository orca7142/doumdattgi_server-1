import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FetchProductOutput {
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

  @Field(() => String, { nullable: true })
  product_product_minAmount: string;

  @Field(() => String, { nullable: true })
  product_product_possibleAmount: string;

  @Field(() => String, { nullable: true })
  product_product_date: string;

  @Field(() => Date)
  product_product_createdAt: Date;

  @Field(() => String)
  u_user_nickname: string;

  @Field(() => String, { nullable: true })
  u_user_profileImage: string;

  @Field(() => String)
  i_image_url: string;
}
