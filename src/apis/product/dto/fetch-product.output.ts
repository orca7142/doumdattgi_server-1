import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FetchOneProductOutput {
  @Field(() => String)
  product_product_id: string;

  @Field(() => String)
  product_product_title: string;

  @Field(() => String)
  product_product_category: string;

  @Field(() => String)
  product_product_workDay: string;

  @Field(() => String)
  u_user_nickname: string;

  @Field(() => String)
  u_user_url: string;

  @Field(() => String)
  i_image_url: string;
}
