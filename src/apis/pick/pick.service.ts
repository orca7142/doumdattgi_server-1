import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pick } from './entites/pick.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../product/entites/product.entity';
import { FetchMyPickOutput } from './dto/fetch-myPick.output';
import {
  IPickServiceCreate,
  IPickServiceFetchPickUser,
} from './interfaces/pick-service.interface';
import { IPickServiceFetchPickOrNot } from './interfaces/pick-service.interface';

@Injectable()
export class PicksService {
  constructor(
    @InjectRepository(Pick)
    private readonly picksRepository: Repository<Pick>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create({ product_id, user_id }: IPickServiceCreate): Promise<string> {
    const userLike = await this.picksRepository.findOne({
      where: { user: { user_id }, product: { product_id } },
      relations: ['user', 'product'],
    });

    if (userLike === null) {
      await this.picksRepository.save({
        user: { user_id },
        product: { product_id },
      });
      return '찜 되었습니다!!';
    } else if (userLike !== null) {
      const pick_id = userLike.pick_id;
      await this.picksRepository.delete({ pick_id });
      return '찜 삭제 되었습니다';
    }
  }

  async fetchPickUser({
    user_id,
    page,
    pageSize,
  }: IPickServiceFetchPickUser): Promise<FetchMyPickOutput[]> {
    const result = await this.picksRepository
      .createQueryBuilder('pick')
      .innerJoin('pick.user', 'u', 'pick.userUserId = u.user_Id')
      .innerJoin('pick.product', 'p', 'pick.productProductId = p.product_Id')
      .innerJoin('p.images', 'i', 'p.product_id = i.productProductId')
      .select([
        'pick.pick_id',
        'p.product_id',
        'p.product_title',
        'p.product_category',
        'p.product_workDay',
        'p.product_sellOrBuy',
        'p.product_summary',
        'u.user_nickname',
        'u.user_profileImage',
        'i.image_url',
      ])
      .where('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('u.user_id = :user_id', { user_id })
      .orderBy('p.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    if (!result.length)
      throw new Error('해당 유저가 찜한 상품이 존재하지 않습니다.');
    return result;
  }

  async fetchPickOrNot({
    user_id,
    product_id,
  }: IPickServiceFetchPickOrNot): Promise<boolean> {
    const result = await this.picksRepository.findOne({
      where: { user: { user_id }, product: { product_id } },
    });
    return result ? true : false;
  }
}
