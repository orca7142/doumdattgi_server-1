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

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    private readonly usersService: UsersService,
  ) {}

  // 의뢰 요청하기
  async sendRequest({
    createRequestInput, //
    context,
  }: ICreateRequestInput): Promise<Request> {
    const { product_id, ...rest } = createRequestInput;

    const seller = await this.productsRepository.findOne({
      where: { product_id },
      relations: ['user'],
    });

    const seller_id = seller.user.user_id;
    const seller_nickname = seller.user.user_nickname;
    const seller_profileImage = seller.user.user_profileImage;

    const buyer = await this.usersService.findLoginUser({ context });
    const buyer_id = buyer.user_id;
    const buyer_nickname = buyer.user_nickname;
    const buyer_profileImage = buyer.user_profileImage;

    return this.requestsRepository.save({
      ...rest,
      request_isAccept: REQUEST_ISACCEPT_ENUM.WAITING,
      product: { product_id },
      seller_id,
      seller_nickname,
      seller_profileImage,
      buyer_id,
      buyer_nickname,
      buyer_profileImage,
    });
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
    if (acceptRefuse === '수락하기') isAccept = REQUEST_ISACCEPT_ENUM.ACCEPT;
    else if (acceptRefuse === '거절하기')
      isAccept = REQUEST_ISACCEPT_ENUM.REFUSE;
    else if (acceptRefuse === '완료하기')
      isAccept = REQUEST_ISACCEPT_ENUM.FINISH;

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
  async requestStart({
    process,
    request_id,
  }: IRequestStartInput): Promise<boolean> {
    const date = new Date();
    if (process === '작업물 전달') {
      const result = await this.requestsRepository.update(
        {
          request_id,
        },
        {
          request_sendAt: date,
        },
      );
      return (await result).affected ? true : false;
    } else if (process === '완료') {
      const result = await this.requestsRepository.update(
        {
          request_id,
        },
        {
          request_completedAt: date,
        },
      );
      return (await result).affected ? true : false;
    }
  }
}
