import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FetchPaymentOutput {
  @Field(() => String)
  payment_payment_id: string;

  @Field(() => String)
  payment_payment_impUid: string;

  @Field(() => Int)
  payment_payment_amount: number;

  @Field(() => String)
  payment_payment_status: string;

  @Field(() => String)
  payment_payment_type: string;

  @Field(() => Date)
  payment_payment_createdAt: Date;

  @Field(() => String)
  u_user_id: string;

  @Field(() => String)
  u_user_email: string;

  @Field(() => String)
  u_user_name: string;

  @Field(() => String)
  u_user_nickname: string;

  @Field(() => String)
  u_user_phone: string;
}
