import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Payment } from '../payment/entities/payment.entity';
import { Request } from '../request/entites/request.entity';
import { Pick } from '../pick/entites/pick.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request, //
      Payment,
      User,
      Pick,
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
