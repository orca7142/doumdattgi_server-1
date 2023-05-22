import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateRequestInput {
  @Field(() => String)
  product_id: string;

  @Field(() => String)
  request_title: string;

  @Field(() => String)
  request_content: string;

  @Field(() => Int)
  request_price: number;
}
