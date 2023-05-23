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
  async create({ product_id, user_id }): Promise<string> {
    const userLike = await this.pickRepository.findOne({
      where: { user: { user_id }, product: { product_id } },
      relations: ['user', 'product'],
    });

    if (userLike === null) {
      await this.pickRepository.save({
        user: { user_id },
        product: { product_id },
      });
      return '찜 되었습니다!!';
    } else if (userLike !== null) {
      const pick_id = userLike.pick_id;
      await this.pickRepository.delete({ pick_id });
      return '찜 삭제 되었습니다';
    }

    // 유저가 찜한 목록 조회
    // 상품의 찜횟수 조회
  }
}
