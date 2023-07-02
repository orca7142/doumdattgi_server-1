import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COUPON_TYPE_ENUM, Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import {
  ICouponsServiceCheckMileage,
  ICouponsServicePurchaseCoupon,
} from './interfaces/coupons-service.interface';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly usersService: UsersService,
  ) {}

  // 유저 마일리지 수정 함수
  async updateMileage({ user_id, mileage }) {
    const myMileage = (
      await this.usersRepository.findOne({ where: { user_id } })
    ).user_mileage;
    await this.usersRepository.update(
      {
        user_id,
      },
      {
        user_mileage: myMileage - mileage,
      },
    );
  }

  // 쿠폰 구매 함수
  async purchaseCoupon({
    context, //
    coupon,
  }: ICouponsServicePurchaseCoupon): Promise<Coupon> {
    const user_id = context.req.user.user_id;
    let couponType = COUPON_TYPE_ENUM.ONE_DAY;
    let mileage = 0;
    const user_mileage = (await this.usersService.findLoginUser({ context }))
      .user_mileage;

    if (coupon === 'ONE_DAY') {
      if (user_mileage >= 1000) {
        couponType = COUPON_TYPE_ENUM.ONE_DAY;
        mileage = 1000;
        await this.updateMileage({ user_id, mileage });
      } else {
        throw new ConflictException('보유하신 마일리지가 부족합니다');
      }
    } else if (coupon === 'THREE_DAYS') {
      if (user_mileage >= 3000) {
        couponType = COUPON_TYPE_ENUM.ONE_DAY;
        mileage = 3000;
        await this.updateMileage({ user_id, mileage });
      } else {
        throw new ConflictException('보유하신 마일리지가 부족합니다');
      }
    } else if (coupon === 'SEVEN_DAYS') {
      if (user_mileage >= 7000) {
        couponType = COUPON_TYPE_ENUM.ONE_DAY;
        mileage = 7000;
        await this.updateMileage({ user_id, mileage });
      } else {
        throw new ConflictException('보유하신 마일리지가 부족합니다');
      }
    }

    return await this.couponsRepository.save({
      user: { user_id },
      coupon_type: couponType,
    });
  }
}
