import {
  HttpException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';

import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { PointTransaction } from '../pointTransaction/entities/pointTransaction.entity';
import {
  IIamportServiceCancel,
  IIamportServiceCheckpaid,
} from './interfaces/iamport-service.interface';

@Injectable()
export class IamportService {
  constructor(
    @InjectRepository(PointTransaction)
    private readonly pointsTransactionsRepository: Repository<PointTransaction>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  // 토큰 발급
  async getToken(): Promise<string> {
    try {
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
          imp_key: process.env.IMP_KEY,
          imp_secret: process.env.IMP_SECRET,
        },
      });

      return getToken.data.response.access_token;
    } catch (error) {
      throw new HttpException(
        error.response.data.message,
        error.response.status,
      );
    }
  }
  // 결제완료 상태인지 검증하기
  async checkPid({ impUid, amount }: IIamportServiceCheckpaid): Promise<void> {
    try {
      const token = await this.getToken();
      const getPaymentData = await axios.get(
        `https://api.iamport.kr/payments/${impUid}`,
        { headers: { Authorization: token } },
      );
      if (amount !== getPaymentData.data.response.amount) {
        throw new UnprocessableEntityException('잘못된 결제 정보입니다.');
      }
      return getPaymentData.data.response;
    } catch (error) {
      if (error?.response?.data?.message) {
        throw new HttpException(
          error.response.data.message,
          error.response.status,
        );
      } else {
        throw error;
      }
    }
  }

  // 결제 취소하기
  async cancel({ impUid }: IIamportServiceCancel): Promise<number> {
    try {
      const token = await this.getToken();

      const result = await axios.post(
        'https://api.iamport.kr/payments/cancel',
        {
          imp_uid: impUid,
        },
        {
          headers: { Authorization: token },
        },
      );
      return result.data.response.cancel_amount;
    } catch (error) {
      throw new HttpException(
        error.response.data.message,
        error.response.status,
      );
    }
  }
}
