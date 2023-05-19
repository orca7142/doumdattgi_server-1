import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  user_email: string;

  @Field(() => String)
  user_password: string;

  @Field(() => String)
  user_nickname: string;

  @Field(() => String)
  user_phone: string;

  @Field(() => String)
  user_name: string;
}
