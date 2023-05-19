import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entites/product.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  IProductServiceCreate,
  IProductServiceDelete,
  IProductServiceFindOne,
  IProductServiceUpdate,
} from './interfaces/product-service.interface';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Product)
    private readonly userRepository: Repository<User>,

    private readonly userService: UsersService,
  ) {}

  // 모든 상품 검색(페이지로 검색 & 최신순으로 검색)
  async findAll({ page, pageSize }): Promise<Product[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('*')
      .orderBy('product.createdAt', 'DESC')
      .skip(pageSize * (page - 1))
      .take(pageSize)
      .getRawMany();

    return result;
  }

  // 랜덤 4개 상품 검색
  async findRandom(): Promise<Product[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('*')
      .orderBy('RAND()')
      .take(4)
      .getRawMany();

    return result;
  }

  // 카테고리별로 상품 검색
  async findCategory({ category }): Promise<Product[]> {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .select('*')
      .where('category LIKE "%":category"%"', { category })
      .orderBy('product.createdAt', 'DESC')
      .getRawMany();

    return result;
  }

  // 신규유저의 상품 검색(workRate가 0인 사람)
  async findNewUser(): Promise<Product[]> {
    const result = await this.productRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.product', 'product')
      .where('user.workRate = workRate', { workRate: 0 })
      .getRawMany();

    return result;
  }

  // 특정상품에 대한 내용만 검색
  findOne({ productId }: IProductServiceFindOne): Promise<Product> {
    return this.productRepository.findOne({
      where: { id: productId },
    });
  }

  // 상품 작성하기
  async create({
    createProductInput,
    user_id,
  }: IProductServiceCreate): Promise<Product> {
    const result = await this.productRepository.save({
      ...createProductInput,
      user: { id: user_id },
    });

    return result;
  }

  // 상품 수정 & 업데이트하기
  async update({
    productId,
    updateProductInput,
  }: IProductServiceUpdate): Promise<boolean> {
    const result = await this.productRepository.update(
      {
        id: productId,
      },
      {
        ...updateProductInput,
      },
    );

    return result ? true : false;
  }

  // 상품 삭제하기
  async delete({ productId }: IProductServiceDelete): Promise<boolean> {
    const result = await this.productRepository.softDelete({ id: productId });
    return result.affected ? true : false; //
  }
}
