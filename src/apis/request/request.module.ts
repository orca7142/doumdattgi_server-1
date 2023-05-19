import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestsResolver } from './request.resolver';
import { RequestsService } from './request.service';
import { User } from '../users/entities/user.entity';
import { EngageIn } from '../engageIn/entites/engaeIn.entity';
import { Product } from '../product/entites/product.entity';
import { PointTransaction } from '../pointTransaction/entities/pointTransaction.entity';
import { UsersService } from '../users/users.service';
import { UsersModule } from '../users/users.module';
import { ProductService } from '../product/product.service';
import { ProductResolver } from '../product/product.resolver';
import { Request } from './entites/request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointTransaction, //
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
