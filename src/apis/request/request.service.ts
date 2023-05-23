import { Injectable } from '@nestjs/common';
import { REQUEST_ISACCEPT_ENUM, Request } from './entites/request.entity';
import {
  ICreateRequestInput,
  IFetchOneRequestInput,
  IFetchRequestInput,
  IFetchWorkInput,
  IRequestAcceptRefuseInput,
  IRequestStartInput,
} from './interfaces/requset-service.interface';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../product/entites/product.entity';
import {
  ENGAGEIN_STATUS_ENUM,
  EngageIn,
} from '../engageIn/entites/engageIn.entity';
import {
  PAYMENT_STATUS_ENUM,
  Payment,
} from '../payment/entities/payment.entity';
import { Slot } from '../slot/entites/slot.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(EngageIn)
    private readonly engageInRepository: Repository<EngageIn>,

    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,

    // @InjectRepository(Slot)
    // private readonly slotsRepository: Repository<Slot>,

    private readonly usersService: UsersService,
  ) {}

  // 의뢰 요청하기
  async sendRequest({
    createRequestInput, //
    context,
  }: ICreateRequestInput): Promise<Request> {
    const { product_id, request_price, ...rest } = createRequestInput;

    const seller = await this.productsRepository.findOne({
      where: { product_id },
      relations: ['user'],
    });

    const seller_id = seller.user.user_id;
    const seller_nickname = seller.user.user_nickname;
    const seller_profileImage = seller.user.user_profileImage;
    const seller_email = seller.user.user_email;

    const buyer = await this.usersService.findLoginUser({ context });
    const buyer_id = buyer.user_id;
    const buyer_nickname = buyer.user_nickname;
    const buyer_profileImage = buyer.user_profileImage;
    const buyer_email = buyer.user_email;

    const result = await this.requestsRepository.save({
      ...rest,
      request_price,
      request_isAccept: REQUEST_ISACCEPT_ENUM.WAITING,
      product: { product_id },
      seller_id,
      seller_nickname,
      seller_profileImage,
      seller_email,
      buyer_id,
      buyer_nickname,
      buyer_profileImage,
      buyer_email,
    });

    const buyer_point = buyer.user_point;

    await this.usersRepository.update(
      {
        user_id: buyer_id,
      },
      {
        user_point: buyer_point - request_price,
      },
    );

    await this.engageInRepository.save({
      engageIn_price: request_price,
      request: { request_id: result.request_id },
      engageIn_status: ENGAGEIN_STATUS_ENUM.WAITING,
    });

    await this.paymentsRepository.save({
      payment_impUid: '',
      payment_amount: -request_price,
      payment_status: PAYMENT_STATUS_ENUM.PAYMENT,
      payment_type: '의뢰서 요청',
      user: { user_id: buyer_id },
    });

    return result;
  }

  // 신청 내역 전체 조회
  async fetchBuyerRequest({ context }: IFetchRequestInput): Promise<Request[]> {
    const buyer_id = (await this.usersService.findLoginUser({ context }))
      .user_id;
    const result = await this.requestsRepository.find({
      where: { buyer_id },
    });
    return result;
  }

  // 특정 신청 내역 전체 조회
  async fetchOneRequest({
    request_id,
  }: IFetchOneRequestInput): Promise<Request> {
    const result = await this.requestsRepository.findOne({
      where: { request_id },
    });
    return result;
  }

  // 작업 진행 내역 조회
  async fetchSellerWork({ context }: IFetchWorkInput): Promise<Request[]> {
    const seller_id = (await this.usersService.findLoginUser({ context }))
      .user_id;
    const workInfo = await this.requestsRepository.find({
      where: { seller_id },
    });
    return workInfo;
  }

  // 의뢰 수락 / 거절
  async requestAcceptRefuse({
    acceptRefuse, //
    request_id,
  }: IRequestAcceptRefuseInput): Promise<Request> {
    const date = new Date();
    let isAccept = REQUEST_ISACCEPT_ENUM.WAITING;

    if (acceptRefuse === '수락하기') {
      isAccept = REQUEST_ISACCEPT_ENUM.ACCEPT;
      await this.engageInRepository.update(
        {
          request: { request_id },
        },
        {
          engageIn_status: ENGAGEIN_STATUS_ENUM.ACCEPT,
        },
      );
    } else if (acceptRefuse === '거절하기') {
      isAccept = REQUEST_ISACCEPT_ENUM.REFUSE;
      await this.engageInRepository.update(
        {
          request: { request_id },
        },
        {
          engageIn_status: ENGAGEIN_STATUS_ENUM.REFUSE,
        },
      );
      const buyer = await this.requestsRepository.findOne({
        where: { request_id },
      });

      const buyer_id = buyer.buyer_id;
      const request_price = buyer.request_price;

      // payment 테이블 거절에 의한 (+) 금액 저장
      await this.paymentsRepository.save({
        payment_impUid: '',
        payment_amount: request_price,
        payment_status: PAYMENT_STATUS_ENUM.CANCEL,
        payment_type: '의뢰서 요청',
        user: { user_id: buyer_id },
      });

      // 의뢰 요청자 돈 다시 돌아가기
      const userPoint = (
        await this.usersRepository.findOne({ where: { user_id: buyer_id } })
      ).user_point;

      await this.usersRepository.update(
        {
          user_id: buyer_id,
        },
        {
          user_point: userPoint + request_price,
        },
      );
    }

    const request = await this.requestsRepository.findOne({
      where: { request_id },
    });

    const result = await this.requestsRepository.save({
      ...request,
      request_id,
      request_isAccept: isAccept,
      request_startAt: date,
    });
    return result;
  }

  // 프로세스
  async requestProcess({
    process,
    request_id,
  }: IRequestStartInput): Promise<boolean> {
    const date = new Date();
    if (process === '작업 완료하기') {
      const workComplete = await this.requestsRepository.update(
        {
          request_id,
        },
        {
          request_sendAt: date,
        },
      );
      return (await workComplete).affected ? true : false;
    } else if (process === '작업 완료 확정하기') {
      const seller_id = (
        await this.requestsRepository.findOne({ where: { request_id } })
      ).seller_id;
      const workRate = (
        await this.usersRepository.findOne({ where: { user_id: seller_id } })
      ).user_workRate;
      await this.usersRepository.update(
        {
          user_id: seller_id,
        },
        {
          user_workRate: workRate + 1,
        },
      );

      const workCompleteConfirm = await this.requestsRepository.update(
        {
          request_id,
        },
        {
          request_completedAt: date,
        },
      );

      const user_id = (
        await this.requestsRepository.findOne({ where: { request_id } })
      ).seller_id;

      const user_point = (
        await this.usersRepository.findOne({ where: { user_id } })
      ).user_point;

      const requestPrice = (
        await this.engageInRepository.findOne({
          where: { request: { request_id } },
        })
      ).engageIn_price;

      await this.usersRepository.update(
        {
          user_id,
        },
        {
          user_point: user_point + requestPrice,
        },
      );

      await this.paymentsRepository.save({
        payment_impUid: '',
        payment_amount: requestPrice,
        payment_status: PAYMENT_STATUS_ENUM.SELL,
        payment_type: '의뢰 완료',
        user: { user_id },
      });

      return (await workCompleteConfirm).affected ? true : false;
    }
  }
}
