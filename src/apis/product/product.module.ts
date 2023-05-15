import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entites/product.entity';
import { User } from '../users/entities/user.entity';
import { ProductResolver } from './product.resolver';
// import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, //
      User,
    ]),
  ],
  providers: [
    ProductResolver, //
    // ProductService,
  ],
})
export class ProductModule {}
