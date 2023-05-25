import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FindCommentsOutput {
  @Field(() => String)
  comment_comment_id: string;

  @Field(() => String)
  r_request_id: string;

  @Field(() => String)
  u_user_nickname: string;

  @Field(() => String)
  u_user_profileImage: string;

  @Field(() => String)
  comment_comment_text: string;

  @Field(() => String)
  comment_sender_id: string;

  @Field(() => Date)
  comment_comment_createdAt: Date;
}
