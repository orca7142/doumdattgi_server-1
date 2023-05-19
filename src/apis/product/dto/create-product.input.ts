import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field(() => Boolean)
  product_sellOrBuy: boolean;

  @Field(() => String)
  product_title: string;

  @Field(() => String)
  product_category: string;

  @Field(() => String)
  product_sub_category: string;

  @Field(() => String)
  product_summary: string;

  @Field(() => String)
  product_main_text: string;

  @Field(() => String)
  product_workDay: string;

  @Field(() => Int)
  product_workTime: number;

  @Field(() => Int)
  product_startTime: number;

  @Field(() => Int)
  product_endTime: number;

  @Field(() => [String])
  product_thumbnailImage: string[];

  @Field(() => [Boolean])
  product_isMain: boolean[];

  @Field(() => String)
  product_postNum: string;

  @Field(() => String)
  product_roadAddress: string;

  @Field(() => String)
  product_detailAddress: string;
}
