import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsResolver } from './request.resolver';
import { RequestsService } from './request.service';
import { User } from '../users/entities/user.entity';
import { EngageIn } from '../engageIn/entites/engaeIn.entity';
import { Product } from '../product/entites/product.entity';
import { Payment } from '../payment/entities/payment.entity';
import { UsersService } from '../users/users.service';
import { ProductService } from '../product/product.service';
import { ProductResolver } from '../product/product.resolver';
import { Request } from './entites/request.entity';
import { Image } from '../image/entites/image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Image, //
      Payment,
      EngageIn,
      Product,
      User,
      Request,
    ]),
  ],
  providers: [
    RequestsResolver, //
    RequestsService,
    UsersService,
    ProductService,
    ProductResolver, //
  ],
})
export class RequestsModule {}
