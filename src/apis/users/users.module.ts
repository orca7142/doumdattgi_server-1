import { Module, forwardRef } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { PointTransaction } from '../pointTransaction/entities/pointTransaction.entity';
import { Request } from '../request/entites/request.entity';
import { RequestsModule } from '../request/request.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request, //
      PointTransaction,
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
