import {
  CACHE_MANAGER,
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { REQUEST_ISACCEPT_ENUM, Request } from './entites/request.entity';
import {
  ICreateRequestInput,
  IFetchOneRequestInput,
  IFetchRequestInput,
  IFetchWorkInput,
  IRequestAcceptRefuseInput,
  IRequestProcessInput,
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
import { MailerService } from '@nestjs-modules/mailer';
import { Cache } from 'cache-manager';
import coolsms from 'coolsms-node-sdk';
import { sendRequestTemplate } from 'src/commons/utils/utils';
const mysms = coolsms;

import 'dotenv/config';
const SMS_KEY = process.env.SMS_KEY;
const SMS_SECRET = process.env.SMS_SECRET;
const SMS_SENDER = process.env.SMS_SENDER;

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

    @InjectRepository(Slot)
    private readonly slotsRepository: Repository<Slot>,

    private readonly usersService: UsersService,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly mailerService: MailerService,
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
    const seller_phone = seller.user.user_phone;

    const buyer = await this.usersService.findLoginUser({ context });
    const buyer_id = buyer.user_id;
    const buyer_nickname = buyer.user_nickname;
    const buyer_profileImage = buyer.user_profileImage;
    const buyer_email = buyer.user_email;
    const buyer_point = buyer.user_point;

    const product_title = seller.product_title;

    await this.mailerService.sendMail({
      from: process.env.EMAIL_SENDER,
      to: seller_email,
      subject: '[도움닫기] 외뢰서 요청에 관하여 알려드립니다.',
      html: sendRequestTemplate({
        seller_nickname,
        buyer_nickname,
        product_title,
      }),
    });

    const messageService = new mysms(SMS_KEY, SMS_SECRET);
    await messageService.sendOne({
      autoTypeDetect: true,
      to: seller_phone,
      from: SMS_SENDER,
      text: `[도움닫기] ${seller_nickname}님 ${buyer_nickname}께서 ${product_title}글에 대해 외뢰서 요청을 하였습니다. 수락 또는 거절을 해주세요.`,
    });

    if (buyer_point < request_price)
      throw new ConflictException('보유한 포인트가 부족합니다.');

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
      payment_status: PAYMENT_STATUS_ENUM.REQUEST,
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
      order: { request_createAt: 'DESC' },
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
      order: { request_createAt: 'DESC' },
    });
    return workInfo;
  }

  // 의뢰 수락 / 거절
  async requestAcceptRefuse({
    acceptRefuse, //
    request_id,
    context,
  }: IRequestAcceptRefuseInput): Promise<Request> {
    const date = new Date();

    if (acceptRefuse === '수락하기') {
      await this.engageInRepository.update(
        {
          request: { request_id },
        },
        {
          engageIn_status: ENGAGEIN_STATUS_ENUM.ACCEPT,
        },
      );
      await this.requestsRepository.update(
        {
          request_id,
        },
        {
          request_isAccept: REQUEST_ISACCEPT_ENUM.ACCEPT,
        },
      );

      // 슬롯 추가하기
      const user_id = context.req.user.user_id;
      const userSlot = await this.slotsRepository.findOne({
        where: { user: { user_id } },
      });

      if (userSlot === null) {
        await this.slotsRepository.save({
          user: { user_id },
          slot_first: true,
        });
      } else {
        const slot_id = userSlot.slot_id;
        const slot_first = userSlot.slot_first;
        const slot_second = userSlot.slot_second;
        const slot_third = userSlot.slot_third;
        if (!slot_first) {
          await this.slotsRepository.save({
            slot_id,
            user: { user_id },
            slot_first: true,
          });
        } else if (!slot_second) {
          await this.slotsRepository.save({
            slot_id,
            user: { user_id },
            slot_second: true,
          });
        } else if (!slot_third) {
          await this.slotsRepository.save({
            slot_id,
            user: { user_id },
            slot_third: true,
          });
        }
      }
    } else if (acceptRefuse === '거절하기') {
      await this.requestsRepository.update(
        {
          request_id,
        },
        {
          request_isAccept: REQUEST_ISACCEPT_ENUM.REFUSE,
        },
      );

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
        payment_status: PAYMENT_STATUS_ENUM.REFUND,
        payment_type: '의뢰서 요청 거절',
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
      request_startAt: date,
    });
    return result;
  }

  // 프로세스
  async requestProcess({
    process,
    request_id,
  }: IRequestProcessInput): Promise<boolean> {
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

      await this.requestsRepository.save({
        request_id,
        request_completedAt: date,
        request_isAccept: REQUEST_ISACCEPT_ENUM.FINISH,
      });

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

      // 슬롯 없애기
      const userSlot = await this.slotsRepository.findOne({
        where: { user: { user_id } },
      });

      console.log('**********');
      console.log(userSlot);
      console.log('***********');

      const slot_id = userSlot.slot_id;
      const slot_first = userSlot.slot_first;
      const slot_second = userSlot.slot_second;
      const slot_third = userSlot.slot_third;

      if (slot_third === true) {
        const slotChangeOne = await this.slotsRepository.update(
          {
            slot_id,
          },
          {
            slot_third: false,
          },
        );
        return (await slotChangeOne).affected ? true : false;
      } else if (slot_second === true) {
        const slotChangeTwo = await this.slotsRepository.update(
          {
            slot_id,
          },
          {
            slot_second: false,
          },
        );
        return (await slotChangeTwo).affected ? true : false;
      } else if (slot_first === true) {
        const slotChangeThird = await this.slotsRepository.update(
          {
            slot_id,
          },
          {
            slot_first: false,
          },
        );
        return (await slotChangeThird).affected ? true : false;
      }
    }
  }
}
