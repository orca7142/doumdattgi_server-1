import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../product/entites/product.entity';
import { User } from '../users/entities/user.entity';
import { PickResolver } from './pick.resolver';
import { Module } from '@nestjs/common';
import { PicksService } from './pick.service';
import { Pick } from './entites/pick.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product, //
      User,
      Pick,
    ]),
  ],
  providers: [
    PickResolver, //
    PicksService,
  ],
})
export class PickModule {}
