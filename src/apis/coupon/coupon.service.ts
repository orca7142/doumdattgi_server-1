import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COUPON_TYPE_ENUM, Coupon } from './entities/coupon.entity';
import { Repository } from 'typeorm';
import {
  ICouponsServicePurchaseCoupon,
  ICouponsServiceUpdateMileage,
} from './interfaces/coupons-service.interface';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Product } from '../product/entites/product.entity';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponsRepository: Repository<Coupon>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    private readonly usersService: UsersService,
  ) {}

  // 유저 마일리지 수정 함수
  async updateMileage({
    user_id,
    mileage,
  }: ICouponsServiceUpdateMileage): Promise<void> {
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

  // 쿠폰 구매 및 사용 함수
  async purchaseCoupon({
    context, //
    coupon,
    productId,
  }: ICouponsServicePurchaseCoupon): Promise<boolean> {
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

    const saveCoupon = await this.couponsRepository.save({
      user: { user_id },
      coupon_type: couponType,
    });

    const couponId = saveCoupon.coupon_id;

    const result = await this.productsRepository.update(
      {
        product_id: productId,
      },
      {
        coupon: { coupon_id: couponId },
      },
    );
    return result ? true : false;
  }
}
