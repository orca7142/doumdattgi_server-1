import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateNicknameIntroduceInput {
  @Field(() => String, { nullable: true })
  nickname: string;

  @Field(() => String, { nullable: true })
  introduce: string;
}
