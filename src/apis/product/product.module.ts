import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entites/product.entity';
import { User } from '../users/entities/user.entity';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { UsersService } from '../users/users.service';
import { Payment } from '../payment/entities/payment.entity';
import { Image } from '../image/entites/image.entity';
import { Request } from '../request/entites/request.entity';
import { Pick } from '../pick/entites/pick.entity';
import { Slot } from '../slot/entites/slot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Slot,
      Image,
      Payment,
      Request,
      Product,
      User,
      Image,
      Pick,
    ]),
  ],
  providers: [
    ProductResolver, //
    ProductService,
    UsersService,
  ],
})
export class ProductModule {}
