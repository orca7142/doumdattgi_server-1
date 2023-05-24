import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateNicknameIntroduceInput {
  @Field(() => String, { nullable: true })
  user_nickname?: string;

  @Field(() => String, { nullable: true })
  user_introduce?: string;
}
