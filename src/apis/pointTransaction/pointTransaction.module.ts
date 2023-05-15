import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PointsTransactionsResolver } from './pointTransaction.resolver';
import { PointsTransactionsService } from './pointTransaction.service';
import { PointTransaction } from './entities/pointTransaction.entity';
import { User } from '../users/entities/user.entity';
import { IamportService } from '../iamport/import.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PointTransaction, //
      User,
    ]),
  ],
  providers: [
    PointsTransactionsResolver, //
    PointsTransactionsService,
    IamportService,
  ],
})
export class PointsTransactionsModule {}
