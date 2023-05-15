import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  category: string;

  @Field(() => String)
  summary: string;

  @Field(() => String)
  main_text: string;

  @Field(() => Boolean)
  sellOrBuy: boolean;

  @Field(() => String)
  userId: string;
}
