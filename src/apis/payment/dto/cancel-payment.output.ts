import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CancelPaymentOutput {
  @Field(() => String)
  payment_id: string;

  @Field(() => String)
  payment_impUid: string;

  @Field(() => Int)
  payment_amount: number;

  @Field(() => String)
  payment_status: string;

  @Field(() => String)
  payment_type: string;

  @Field(() => Date)
  payment_createdAt: Date;
}
