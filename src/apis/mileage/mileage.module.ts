import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mileage } from '../mileage/entities/mileage.entity';
import { MileagesResolver } from './mileage.resolver';
import { MileagesService } from './mileage.service';
import { User } from '../users/entities/user.entity';
import { Product } from '../product/entites/product.entity';
import { UsersService } from '../users/users.service';
import { Payment } from '../payment/entities/payment.entity';
import { Slot } from '../slot/entites/slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Mileage, //
      User,
      Product,
      Payment,
      Slot,
    ]),
  ],
  providers: [
    MileagesResolver, //
    MileagesService,
    UsersService,
  ],
})
export class MileagesModule {}
