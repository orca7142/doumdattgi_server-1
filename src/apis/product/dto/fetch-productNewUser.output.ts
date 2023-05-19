import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FetchProductOutput {
  @Field(() => String)
  product_id: string;

  @Field(() => String)
  product_title: string;

  @Field(() => String)
  product_category: string;

  @Field(() => String)
  product_workDay: string;

  @Field(() => String)
  product_url: string;

  @Field(() => String)
  u_nickname: string;

  @Field(() => String)
  u_url: string;
}
