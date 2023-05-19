import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { Payment } from '../payment/entities/payment.entity';
import { Request } from '../request/entites/request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request, //
      Payment,
      User,
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
