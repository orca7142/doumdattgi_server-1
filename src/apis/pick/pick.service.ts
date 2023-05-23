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

    @InjectRepository(User)
    private readonly productsRepository: Repository<Product>,
  ) {}

  // 찜 올리기고 내리기(찜했으면 지우고 찜 없으면 생성)
  async create({ product_id, user_id }): Promise<any> {
    console.log('11');

    const product = await this.productsRepository.findOne({
      where: { product_id },
      relations: ['user'],
    });
    console.log(product);

    const user_pick = (
      await this.pickRepository.findOne({
        where: { user: user_id, product: product_id },
        relations: ['user', 'product'],
      })
    ).pick_id;
    console.log(user_pick);

    // if (!user_pick) {
    //   await this.pickRepository.save({
    //     pick_status: true,
    //     product: { product_id: product },
    //     user: { user_id },
    //   });
    //   return true;
    // } else {
    //   await this.delete({ product_id, user_pick });
    //   return false;
    // }
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
