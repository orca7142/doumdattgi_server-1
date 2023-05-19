import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInfoInput {
  @Field(() => String, { nullable: true })
  user_name: string;

  @Field(() => String, { nullable: true })
  user_email: string;

  @Field(() => String, { nullable: true })
  user_portfolio: string;
}
