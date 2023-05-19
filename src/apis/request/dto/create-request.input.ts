import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateRequestInput {
  @Field(() => String)
  productId: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  content: string;

  @Field(() => String)
  seller: string;

  //   @Field(() => [String])
  //   images: string[];

  @Field(() => Int)
  price: number;
}
