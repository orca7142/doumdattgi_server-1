import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  COUPON_TYPE_ENUM,
  MILEAGE_STATUS_ENUM,
  Mileage,
} from './entities/mileage.entity';
import {
  IMileagesServiceMileageHistory,
  IMileagesServiceMileageProductHistory,
  IMileagesServicePurchaseCoupon,
  IMileagesServiceUpdateMileage,
} from './interfaces/mileage-service.interface';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import {
  PRODUCT_CATEGORY_ENUM,
  Product,
} from '../product/entites/product.entity';

@Injectable()
export class MileagesService {
  constructor(
    @InjectRepository(Mileage)
    private readonly mileagesRepository: Repository<Mileage>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    private readonly usersService: UsersService,
  ) {}

  // 유저 마일리지 조회 함수
  async mileageHistory({
    context,
  }: IMileagesServiceMileageHistory): Promise<Mileage[]> {
    const user_id = context.req.user.user_id;
    return await this.mileagesRepository.find({
      where: { user: { user_id } },
      order: { mileage_createdAt: 'DESC' },
    });
  }

  // 유저 마일리지 수정 함수
  async updateMileage({
    user_id,
    mileage,
    couponType,
  }: IMileagesServiceUpdateMileage): Promise<string> {
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

    // 마일리지 테이블 저장하기
    const saveMileage = await this.mileagesRepository.save({
      mileage_status: MILEAGE_STATUS_ENUM.EXPENSE,
      mileage_coupon: couponType,
      payment_amount: mileage,
      user: { user_id },
    });

    return saveMileage.mileage_id;
  }

  // 쿠폰 구매 및 사용 함수
  async purchaseCoupon({
    context, //
    coupon,
    productId,
  }: IMileagesServicePurchaseCoupon): Promise<boolean> {
    const user_id = context.req.user.user_id;
    let couponType = COUPON_TYPE_ENUM.ONE_DAY;
    let mileage = 0;
    const user_mileage = (await this.usersService.findLoginUser({ context }))
      .user_mileage;
    let mileage_id = '';

    if (coupon === 'ONE_DAY') {
      if (user_mileage >= 5000) {
        couponType = COUPON_TYPE_ENUM.ONE_DAY;
        mileage = 5000;
        mileage_id = await this.updateMileage({ user_id, mileage, couponType });
      } else {
        throw new ConflictException('보유하신 마일리지가 부족합니다');
      }
    } else if (coupon === 'THREE_DAYS') {
      if (user_mileage >= 10000) {
        couponType = COUPON_TYPE_ENUM.THREE_DAYS;
        mileage = 10000;
        mileage_id = await this.updateMileage({ user_id, mileage, couponType });
      } else {
        throw new ConflictException('보유하신 마일리지가 부족합니다');
      }
    } else if (coupon === 'SEVEN_DAYS') {
      if (user_mileage >= 20000) {
        couponType = COUPON_TYPE_ENUM.SEVEN_DAYS;
        mileage = 20000;
        mileage_id = await this.updateMileage({ user_id, mileage, couponType });
      } else {
        throw new ConflictException('보유하신 마일리지가 부족합니다');
      }
    }

    const result = await this.productsRepository.update(
      {
        product_id: productId,
      },
      {
        mileage: { mileage_id },
      },
    );
    return result ? true : false;
  }

  // 유저 마일리지 적용 상품 조회 함수
  async mileageProductHistory({
    context,
  }: IMileagesServiceMileageProductHistory): Promise<Product[]> {
    const user_id = context.req.user.user_id;

    const mileage = await this.mileagesRepository.find({
      where: { user: { user_id } },
      relations: ['user'],
      order: { mileage_createdAt: 'DESC' },
    });

    const result = [];

    for (let i = 0; i < mileage.length; i++) {
      const mileage_id = mileage[i].mileage_id;
      result.push(
        await this.productsRepository.findOne({
          where: { mileage: { mileage_id } },
          relations: ['mileage', 'images'],
        }),
      );
    }
    return result;
  }

  randomMileageProduct(mileageProduct, count) {
    const shuffledProduct = mileageProduct.slice();
    for (let i = shuffledProduct.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledProduct[i], shuffledProduct[j]] = [
        shuffledProduct[j],
        shuffledProduct[i],
      ];
    }
    return shuffledProduct.slice(0, count);
  }

  // 마일리지 적용 상품 조회 함수
  async fetchRandomMileageProduct({
    category, //
  }): Promise<Product[]> {
    let chkcategory = PRODUCT_CATEGORY_ENUM.IT;

    if (category === 'IT') {
      chkcategory = PRODUCT_CATEGORY_ENUM.IT;
    } else if (category === 'DESIGN') {
      chkcategory = PRODUCT_CATEGORY_ENUM.DESIGN;
    } else if (category === 'TRANSLATE') {
      chkcategory = PRODUCT_CATEGORY_ENUM.TRANSLATE;
    } else if (category === 'VIDEO') {
      chkcategory = PRODUCT_CATEGORY_ENUM.VIDEO;
    } else if (category === 'MARKETING') {
      chkcategory = PRODUCT_CATEGORY_ENUM.MARKETING;
    } else if (category === 'DOCUMENT') {
      chkcategory = PRODUCT_CATEGORY_ENUM.DOCUMENT;
    }

    const mileageProduct = [];

    const findProduct = await this.productsRepository.find({
      where: { product_category: chkcategory },
      relations: ['mileage', 'images', 'user'],
    });
    for (let i = 0; i < findProduct.length; i++) {
      if (findProduct[i].mileage) {
        mileageProduct.push(findProduct[i]);
      }
    }
    const result = this.randomMileageProduct(mileageProduct, 3);

    return result;
  }
}
