import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { PointTransaction } from '../pointTransaction/entities/pointTransaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointTransaction,
      User, //
    ]),
  ],
  providers: [
    UsersResolver, //
    UsersService,
  ],

  exports: [
    UsersService, //
  ],
})
export class UsersModule {}
