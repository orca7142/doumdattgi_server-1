import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entites/product.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  IProductServiceCreate,
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

  // 모든 상품 검색
  findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['user'],
    });
  }

  // 특정상품에 대한 내용만 검색
  findOne({ productId }: IProductServiceFindOne): Promise<Product> {
    return this.productRepository.findOne({
      where: { id: productId },
      relations: ['user'],
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
}
