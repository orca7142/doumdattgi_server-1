import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { User } from '../users/entities/user.entity';
import { CouponsResolver } from './coupon.resolver';
import { CouponsService } from './coupon.service';
import { UsersService } from '../users/users.service';
import { Payment } from '../payment/entities/payment.entity';
import { Slot } from '../slot/entites/slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coupon, //
      User,
      Payment,
      Slot,
    ]),
  ],
  providers: [
    CouponsResolver, //
    CouponsService,
    UsersService,
  ],
})
export class CouponsModule {}
