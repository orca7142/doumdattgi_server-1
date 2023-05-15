import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import {
  PointTransaction,
  POINT_TRANSACTION_STATUS_ENUM,
} from './entities/pointTransaction.entity';
import {
  IPointsTransactionsServiceCancel,
  IPointsTransactionsServiceCheckAlreadyCanceled,
  IPointsTransactionsServiceCheckDuplication,
  IPointsTransactionsServiceCheckHasCancelablePoint,
  IPointsTransactionsServiceCreate,
  IPointsTransactionsServiceCreateFindOneByImUid,
  IPointsTransactionsServiceCreateForPayment,
  IPointsTransactionsServiceFindByImpUidAndUser,
} from './interfaces/point-transactions-service.interface';
import { IamportService } from '../iamport/import.service';

@Injectable()
export class PointsTransactionsService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly pointsTransactionsRepository: Repository<PointTransaction>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly iamportService: IamportService,

    private readonly dataSource: DataSource,
  ) {}

  // 중복 결제인지 확인
  findOneByImpUid({
    impUid,
  }: IPointsTransactionsServiceCreateFindOneByImUid): Promise<PointTransaction> {
    return this.pointsTransactionsRepository.findOne({
      where: { impUid: impUid },
    });
  }

  // 이미 결제됐던 id인지 검증하기
  async checkDuplication({
    impUid,
  }: IPointsTransactionsServiceCheckDuplication): Promise<void> {
    const result = await this.findOneByImpUid({ impUid });
    if (result) throw new ConflictException('이미 등록된 결제입니다.');
  }

  // 포인트 충전 및 검증
  async create({
    impUid,
    amount,
    user: _user,
    status = POINT_TRANSACTION_STATUS_ENUM.PAYMENT,
  }: IPointsTransactionsServiceCreate): Promise<PointTransaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      // 1. PointTransaction 테이블에 거래기록 1줄 생성
      const pointTransaction = this.pointsTransactionsRepository.create({
        impUid,
        amount,
        user: _user,
        status,
      });
      await queryRunner.manager.save(pointTransaction);

      // 2. 유저의 돈 찾아오기
      const user = await queryRunner.manager.findOne(User, {
        where: { id: _user.id },
        lock: { mode: 'pessimistic_write' },
      });

      // 3. 유저의 돈 업데이트하기
      const updatedUser = this.usersRepository.create({
        ...user,
        point: user.point + amount,
      });
      await queryRunner.manager.save(updatedUser);
      await queryRunner.commitTransaction();

      // 4. 최종결과 브라우저에 돌려주기
      return pointTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // 유저 아이디로 결제내역 조회하기
  findByImpUidAndUser({
    impUid,
    user,
  }: IPointsTransactionsServiceFindByImpUidAndUser): Promise<
    PointTransaction[]
  > {
    return this.pointsTransactionsRepository.find({
      where: { impUid, user: { id: user.id } },
      relations: ['user'],
    });
  }

  // 이미 취소됐던 id인지 검증하기
  checkAlreadyCanceled({
    pointTransactions,
  }: IPointsTransactionsServiceCheckAlreadyCanceled): void {
    const canceledPointTransactions = pointTransactions.filter(
      (el) => el.status === POINT_TRANSACTION_STATUS_ENUM.CANCEL,
    );
    if (canceledPointTransactions.length)
      throw new ConflictException('이미 취소된 결제 아이디입니다.');
  }

  //포인트가 취소하기에 충분히 있는지 검증하기(결제내역이 없거나, 결제금액보다 포이트가 적은지 확인)
  checkHasCancelablePoint({
    pointTransactions,
  }: IPointsTransactionsServiceCheckHasCancelablePoint): void {
    const paidPointTransactions = pointTransactions.filter(
      (el) => el.status === POINT_TRANSACTION_STATUS_ENUM.PAYMENT,
    );
    if (!paidPointTransactions.length)
      throw new UnprocessableEntityException('결제기록이 존재하지 않습니다.');

    if (paidPointTransactions[0].user.point < paidPointTransactions[0].amount)
      throw new UnprocessableEntityException('포인트가 부족합니다.');
  }

  // 최종 검증 및 포인트 충전
  async createForPayment({
    impUid,
    amount,
    user,
  }: IPointsTransactionsServiceCreateForPayment): Promise<PointTransaction> {
    await this.iamportService.checkPid({
      impUid,
      amount,
    });
    await this.checkDuplication({ impUid });

    return this.create({ impUid, amount, user });
  }

  // 포인트 환불 및 취소된 결과 등록하기
  async cancel({
    impUid,
    user,
  }: IPointsTransactionsServiceCancel): Promise<PointTransaction> {
    const pointTransactions = await this.findByImpUidAndUser({ impUid, user });
    this.checkAlreadyCanceled({ pointTransactions });
    this.checkHasCancelablePoint({ pointTransactions });

    const canceledAmount = await this.iamportService.cancel({ impUid });

    return this.create({
      impUid,
      amount: -canceledAmount,
      status: POINT_TRANSACTION_STATUS_ENUM.CANCEL,
      user,
    });
  }
}
