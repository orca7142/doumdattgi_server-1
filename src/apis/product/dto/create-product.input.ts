import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  category: string;

  @Field(() => String)
  sub_category: string;

  @Field(() => String)
  summary: string;

  @Field(() => String)
  main_text: string;

  @Field(() => Boolean)
  sellOrBuy: boolean;

  @Field(() => String)
  workDay: string;

  @Field(() => Int)
  startTime: number;

  @Field(() => Int)
  endTime: number;

  @Field(() => Int)
  workTime: number;

  @Field(() => String)
  postNum: string;

  @Field(() => String)
  roadAddress: string;

  @Field(() => String)
  detailAddress: string;
}
