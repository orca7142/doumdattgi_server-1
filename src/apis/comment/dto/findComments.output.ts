import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FindCommentsOutput {
  @Field(() => String)
  comment_comment_id: string;

  @Field(() => String)
  r_request_id: string;

  @Field(() => String)
  comment_comment_text: string;

  @Field(() => String)
  comment_comment_sellerOrBuyer: string;

  @Field(() => Date)
  comment_comment_createdAt: Date;
}
