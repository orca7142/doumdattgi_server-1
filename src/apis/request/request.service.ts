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
  IRequestsServiceRequestCompleteInput,
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
import {
  requestAcceptTemplate,
  requestCompleteTemplate,
  requestRefuseTemplate,
  sendRequestTemplate,
} from 'src/commons/utils/utils';

import 'dotenv/config';
import { Cron } from '@nestjs/schedule';
import {
  COUPON_TYPE_ENUM,
  MILEAGE_STATUS_ENUM,
  Mileage,
} from '../mileage/entities/mileage.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(Mileage)
    private readonly mileagesRepository: Repository<Mileage>,

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

  // 작업 완료 확정하기 함수
  async requestComplete({
    request_id,
  }: IRequestsServiceRequestCompleteInput): Promise<void> {
    const date = new Date();

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

    const user_mileage = (
      await this.usersRepository.findOne({ where: { user_id } })
    ).user_mileage;

    const requestPrice = (
      await this.engageInRepository.findOne({
        where: { request: { request_id } },
      })
    ).engageIn_price;

    //의뢰서 작업 금액의 5% 차감 및 마일리지 및 포인트로 전환
    const mileage = requestPrice * 0.05;
    const earnMoney = requestPrice - mileage;

    await this.usersRepository.update(
      {
        user_id,
      },
      {
        user_point: user_point + earnMoney,
        user_mileage: user_mileage + mileage,
      },
    );

    // 마일리지 테이블 내역 저장
    await this.mileagesRepository.save({
      mileage_status: MILEAGE_STATUS_ENUM.INCOME,
      mileage_coupon: COUPON_TYPE_ENUM.NONE,
      payment_amount: mileage,
      user: { user_id },
    });

    await this.paymentsRepository.save({
      payment_impUid: '',
      payment_amount: requestPrice,
      payment_status: PAYMENT_STATUS_ENUM.SELL,
      payment_type: '의뢰 완료',
      user: { user_id },
    });

    const userSlot = await this.slotsRepository.findOne({
      where: { user: { user_id } },
    });

    const slot_id = userSlot.slot_id;
    const slot_first = userSlot.slot_first;
    const slot_second = userSlot.slot_second;
    const slot_third = userSlot.slot_third;

    if (slot_third === true) {
      await this.slotsRepository.update(
        {
          slot_id,
        },
        {
          slot_third: false,
        },
      );
    } else if (slot_second === true) {
      await this.slotsRepository.update(
        {
          slot_id,
        },
        {
          slot_second: false,
        },
      );
    } else if (slot_first === true) {
      await this.slotsRepository.update(
        {
          slot_id,
        },
        {
          slot_first: false,
        },
      );
    }
  }

  // 의뢰 요청하는 함수
  async sendRequest({
    createRequestInput, //
    context,
  }: ICreateRequestInput): Promise<Request> {
    const { product_id, request_price, ...rest } = createRequestInput;

    const minPrice = (
      await this.productsRepository.findOne({ where: { product_id } })
    ).product_minAmount;
    if (request_price < Number(minPrice)) {
      throw new ConflictException('최소신청금액보다 의뢰서요청금액이 적습니다');
    }

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
    const buyer_point = buyer.user_point;

    const product_title = seller.product_title;

    if (buyer_point < request_price)
      throw new ConflictException('보유한 포인트가 부족합니다.');

    const checkSameRequest = await this.requestsRepository.findOne({
      where: { buyer_id, seller_id, product: { product_id } },
    });
    if (checkSameRequest)
      throw new ConflictException('같은 상품을 중복 요청했습니다');
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

    await this.mailerService.sendMail({
      from: process.env.EMAIL_SENDER,
      to: seller_email,
      subject: '[도움닫기] 의뢰서 요청에 관하여 알려드립니다.',
      html: sendRequestTemplate({
        seller_nickname,
        buyer_nickname,
        product_title,
      }),
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

  async fetchBuyerRequest({ context }: IFetchRequestInput): Promise<Request[]> {
    const buyer_id = (await this.usersService.findLoginUser({ context }))
      .user_id;
    const result = await this.requestsRepository.find({
      where: { buyer_id },
      order: { request_createAt: 'DESC' },
    });
    return result;
  }

  async fetchOneRequest({
    request_id,
  }: IFetchOneRequestInput): Promise<Request> {
    const result = await this.requestsRepository.findOne({
      where: { request_id },
      relations: ['product'],
    });
    return result;
  }

  async fetchSellerWork({ context }: IFetchWorkInput): Promise<Request[]> {
    const seller_id = (await this.usersService.findLoginUser({ context }))
      .user_id;
    const workInfo = await this.requestsRepository.find({
      where: { seller_id },
      order: { request_createAt: 'DESC' },
    });
    return workInfo;
  }

  async requestAcceptRefuse({
    acceptRefuse,
    request_id,
    context,
  }: IRequestAcceptRefuseInput): Promise<Request> {
    const date = new Date();

    const requestUser = await this.requestsRepository.findOne({
      where: { request_id },
    });

    const seller_email = requestUser.seller_email;
    const seller_nickname = requestUser.seller_nickname;
    const buyer_nickname = requestUser.buyer_nickname;
    const request_title = requestUser.request_title;

    if (acceptRefuse === '수락하기') {
      await this.mailerService.sendMail({
        from: process.env.EMAIL_SENDER,
        to: seller_email,
        subject: '[도움닫기] 의뢰서 요청에 관하여 알려드립니다.',
        html: requestAcceptTemplate({
          seller_nickname,
          buyer_nickname,
          request_title,
        }),
      });

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
      await this.mailerService.sendMail({
        from: process.env.EMAIL_SENDER,
        to: seller_email,
        subject: '[도움닫기] 의뢰서 요청에 관하여 알려드립니다.',
        html: requestRefuseTemplate({
          seller_nickname,
          buyer_nickname,
          request_title,
        }),
      });
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

      await this.paymentsRepository.save({
        payment_impUid: '',
        payment_amount: request_price,
        payment_status: PAYMENT_STATUS_ENUM.REFUND,
        payment_type: '의뢰서 요청 거절',
        user: { user_id: buyer_id },
      });

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

  async requestProcess({
    process,
    request_id,
  }: IRequestProcessInput): Promise<boolean> {
    const date = new Date();

    const requestUser = await this.requestsRepository.findOne({
      where: { request_id },
    });

    const sellerNickname = requestUser.seller_nickname;
    const buyerNickname = requestUser.buyer_nickname;
    const requestTitle = requestUser.request_title;
    const seller = requestUser.seller_id;
    const seller_phone = (
      await this.usersRepository.findOne({ where: { user_id: seller } })
    ).user_phone;

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
      await this.requestComplete({
        seller_phone,
        sellerNickname,
        buyerNickname,
        requestTitle,
        request_id,
      });
      return true;
    }
  }

  // 1시간마다 작업 완료 확정 만료시간 확인 및 업데이트
  @Cron('0 0-23/1 * * *')
  async checkRequestComplete() {
    const result = await this.requestsRepository.find();
    for (let i = 0; i < result.length; i++) {
      if (result[i].request_completedAt === null && result[i].request_sendAt) {
        const target = result[i].request_sendAt.getTime() + 259200000;
        const change = new Date().getTime();
        const differ = target - change;
        if (differ < 0) {
          console.log('작업 확정 완료하기 자동으로 진행');
          const seller_id = result[i].seller_id;
          const seller_phone = (
            await this.usersRepository.findOne({
              where: { user_id: seller_id },
            })
          ).user_phone;
          const sellerNickname = result[i].seller_nickname;
          const buyerNickname = result[i].buyer_nickname;
          const requestTitle = result[i].request_title;
          const request_id = result[i].request_id;
          await this.requestComplete({
            seller_phone,
            sellerNickname,
            buyerNickname,
            requestTitle,
            request_id,
          });
        }
      } else {
        continue;
      }
    }
  }
}
