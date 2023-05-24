import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCommentInput {
  @Field(() => String)
  request_id: string;

  @Field(() => String)
  sender_id: string;

  @Field(() => String)
  text: string;
}
