import { UseGuards } from '@nestjs/common';
import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { IContext } from 'src/commons/interfaces/context';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payment.service';
import { FetchPaymentOutput } from './dto/fetch-payment.output';
import { CancelPaymentOutput } from './dto/cancel-payment.output';

@Resolver()
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Payment)
  createPayment(
    @Args('payment_impUid') payment_impUid: string, //
    @Args({ name: 'payment_amount', type: () => Int }) payment_amount: number,
    @Args('payment_type') payment_type: string, //
    @Context() context: IContext,
  ): Promise<Payment> {
    const user = context.req.user;
    return this.paymentsService.createForPayment({
      payment_impUid,
      payment_amount,
      user,
      payment_type,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => CancelPaymentOutput)
  cancelPayment(
    @Args('payment_impUid') payment_impUid: string,
    @Args('payment_type') payment_type: string,
    @Context() context: IContext,
  ) {
    const user = context.req.user;
    return this.paymentsService.cancel({
      payment_impUid,
      user,
      payment_type,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Query(() => [FetchPaymentOutput])
  fetchPayments(
    @Args('payment_status', { nullable: true }) payment_status: string,
    @Args('page') page: number,
    @Args('pageSize') pageSize: number,
    @Context() context: IContext,
  ): Promise<FetchPaymentOutput[]> {
    const user_id = context.req.user.user_id;
    return this.paymentsService.findPayment({
      user_id,
      payment_status,
      page,
      pageSize,
    });
  }
}
