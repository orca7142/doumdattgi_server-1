import { Injectable } from '@nestjs/common';
import { REQUEST_ISACCEPT_ENUM, Request } from './entites/request.entity';
import {
  ICreateRequestInput,
  IFetchRequestInput,
  IFetchWorkInput,
} from './interfaces/requset-service.interface';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../product/entites/product.entity';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    private readonly usersService: UsersService,
  ) {}

  // 의뢰 요청하기
  async sendRequest({
    createRequestInput, //
    context,
  }: ICreateRequestInput): Promise<Request> {
    const { product_id, ...rest } = createRequestInput;
    const loginUserId = (await this.usersService.findLoginUser({ context }))
      .user_id;
    return this.requestsRepository.save({
      ...rest,
      request_isAccept: REQUEST_ISACCEPT_ENUM.WAITING,
      product: { product_id },
      user: { user_id: loginUserId },
    });
  }

  // 신청 내역 조회
  async fetchRequest({ context }: IFetchRequestInput): Promise<Request[]> {
    const loginUserId = (await this.usersService.findLoginUser({ context }))
      .user_id;
    const requestInfo = await this.requestsRepository.find({
      where: { user: { user_id: loginUserId } },
      relations: ['user', 'product'],
    });
    return requestInfo;
  }

  // 작업 진행 내역 조회
  async fetchWork({ context }: IFetchWorkInput): Promise<Request[]> {
    const loginUserId = (await this.usersService.findLoginUser({ context }))
      .user_id;
    const workInfo = await this.requestsRepository.find({
      where: { user: { user_id: loginUserId } },
      relations: ['user', 'product'],
    });
    return workInfo;
  }
}
