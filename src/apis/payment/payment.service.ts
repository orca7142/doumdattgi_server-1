import {
  ConflictException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Payment, PAYMENT_STATUS_ENUM } from './entities/payment.entity';
import { IamportService } from '../iamport/import.service';
import {
  IPaymentsServiceCancel,
  IPaymentsServiceCheckAlreadyCanceled,
  IPaymentsServiceCheckDuplication,
  IPaymentsServiceCheckHasCancelablePoint,
  IPaymentsServiceCreate,
  IPaymentsServiceCreateFindOneByImUid,
  IPaymentsServiceCreateForPayment,
  IPaymentsServiceFindByImpUidAndUser,
} from './interfaces/payment-service.interface';
import { FetchPaymentOutput } from './dto/fetch-payment.output';
import { CancelPaymentOutput } from './dto/cancel-payment.output';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly iamportsService: IamportService,

    private readonly dataSource: DataSource,
  ) {}

  // 중복 결제인지 확인
  findOneByImpUid({
    payment_impUid,
  }: IPaymentsServiceCreateFindOneByImUid): Promise<Payment> {
    return this.paymentsRepository.findOne({
      where: { payment_impUid },
    });
  }

  // 이미 결제됐던 id인지 검증하기
  async checkDuplication({
    payment_impUid,
  }: IPaymentsServiceCheckDuplication): Promise<void> {
    const result = await this.findOneByImpUid({ payment_impUid });
    if (result) throw new ConflictException('이미 등록된 결제입니다.');
  }

  // 포인트 충전 및 검증
  async create({
    payment_impUid,
    payment_amount,
    user: _user,
    payment_status = PAYMENT_STATUS_ENUM.PAYMENT,
    payment_type,
  }: IPaymentsServiceCreate): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('SERIALIZABLE');
    try {
      const payment = this.paymentsRepository.create({
        payment_impUid,
        payment_amount,
        user: { user_id: _user.user_id },
        payment_status,
        payment_type,
      });
      await queryRunner.manager.save(payment);

      const user = await queryRunner.manager.findOne(User, {
        where: { user_id: _user.user_id },
        lock: { mode: 'pessimistic_write' },
      });

      const updatedUser = this.usersRepository.create({
        ...user,
        user_point: user.user_point + payment_amount,
      });
      await queryRunner.manager.save(updatedUser);
      await queryRunner.commitTransaction();

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // 유저 아이디로 결제내역 조회하기
  async findPayment({
    user_id,
    page,
    pageSize,
  }): Promise<FetchPaymentOutput[]> {
    const result = await this.paymentsRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.user', 'u', 'payment.userUserId = u.user_Id')
      .select([
        'payment.payment_id',
        'payment.payment_impUid',
        'payment.payment_amount',
        'payment.payment_status',
        'payment.payment_type',
        'payment.payment_createdAt',
        'u.user_id',
        'u.user_email',
        'u.user_name',
        'u.user_nickname',
        'u.user_phone',
      ])
      .where('u.user_id = :user_id', { user_id })
      .orderBy('payment.payment_createdAt', 'DESC')
      .offset(pageSize * (page - 1))
      .limit(pageSize)
      .getRawMany();
    console.log(result);
    return result;
  }

  // 결제내역 조회하기
  async findByImpUidAndUser({
    payment_impUid,
    user,
  }: IPaymentsServiceFindByImpUidAndUser): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { payment_impUid, user: { user_id: user.user_id } },
      relations: ['user'],
    });
  }

  // 이미 취소됐던 id인지 검증하기
  checkAlreadyCanceled({
    payments,
  }: IPaymentsServiceCheckAlreadyCanceled): void {
    const canceledPayments = payments.filter(
      (el) => el.payment_status === PAYMENT_STATUS_ENUM.CANCEL,
    );
    if (canceledPayments.length)
      throw new ConflictException('이미 취소된 결제 아이디입니다.');
  }

  //포인트가 취소하기에 충분히 있는지 검증하기(결제내역이 없거나, 결제금액보다 포이트가 적은지 확인)
  checkHasCancelablePoint({
    payments,
  }: IPaymentsServiceCheckHasCancelablePoint): void {
    const paidPayments = payments.filter(
      (el) => el.payment_status === PAYMENT_STATUS_ENUM.PAYMENT,
    );
    if (!paidPayments.length)
      throw new UnprocessableEntityException('결제기록이 존재하지 않습니다.');

    if (paidPayments[0].user.user_point < paidPayments[0].payment_amount)
      throw new UnprocessableEntityException('포인트가 부족합니다.');
  }

  // 최종 검증 및 포인트 충전
  async createForPayment({
    payment_impUid,
    payment_amount,
    user,
    payment_type,
  }: IPaymentsServiceCreateForPayment): Promise<Payment> {
    await this.iamportsService.checkPid({
      payment_impUid,
      payment_amount,
    });
    await this.checkDuplication({ payment_impUid });

    return this.create({ payment_impUid, payment_amount, user, payment_type });
  }

  // 포인트 환불 및 취소된 결과 등록하기
  async cancel({
    payment_impUid,
    user,
    payment_type,
  }: IPaymentsServiceCancel): Promise<CancelPaymentOutput> {
    const payments = await this.findByImpUidAndUser({ payment_impUid, user });
    this.checkAlreadyCanceled({ payments });
    this.checkHasCancelablePoint({ payments });

    const canceledAmount = await this.iamportsService.cancel({
      payment_impUid,
    });

    return this.create({
      payment_impUid,
      payment_amount: -canceledAmount,
      payment_status: PAYMENT_STATUS_ENUM.CANCEL,
      user,
      payment_type,
    });
  }
}
