import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pick } from './entites/pick.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Product } from '../product/entites/product.entity';

@Injectable()
export class PicksService {
  constructor(
    @InjectRepository(Pick)
    private readonly pickRepository: Repository<Pick>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  // 찜 올리기고 내리기(찜했으면 지우고 찜 없으면 생성)
  async create({ product_id, user_id }): Promise<any> {
    console.log('11');

    const user_pick = await this.pickRepository
      .createQueryBuilder('pick')
      .innerJoin('pick.user', 'u', 'pick.userUserId = u.user_Id')
      .innerJoin('pick.product', 'p', 'p.pickPickId = pick_id')
      .select(['u.user_id', 'pick_id', 'p.product_id'])
      .where('p.product_id = :product_id', { product_id })
      .andWhere('u.user_id = :user_id', { user_id })
      .getRawOne();
    console.log(user_pick.pick_id);
    // const user_pick = (
    //   await this.pickRepository.findOne({
    //     where: { user: { user_id } },
    //     relations: ['user'],
    //   })
    // ).user.user_id;

    if (!user_pick) {
      await this.pickRepository.save({
        pick_status: true,
        product: { product_id },
        user: { user_id },
      });
      return true;
    } else {
      await this.delete({ product_id, user_pick });
      return false;
    }
  }

  // 찜 지우기
  async delete({ product_id, user_pick }): Promise<boolean> {
    const product = (await this.productsRepository.findOne(product_id))
      .product_id;

    const result = await this.pickRepository.delete({
      product: { product_id: product },
      pick_id: user_pick,
    });
    //
    return result.affected ? true : false; //
  }

  // 유저가 찜한 목록 조회

  // 상품의 찜횟수 조회
}
