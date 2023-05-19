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
import { Image } from '../image/entites/image.entity';
import { FetchProductOutput } from './dto/fetch-productNewUser.output';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>, //

    private readonly usersService: UsersService,
  ) {}

  // 모든 상품 검색(페이지로 검색 & 최신순으로 검색)
  async findAll({ page, pageSize }): Promise<Product[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('*')
      .orderBy('product.product_createdAt', 'DESC')
      .skip(pageSize * (page - 1))
      .take(pageSize)
      .getRawMany();

    return result;
  }

  // 랜덤 4개 상품 검색
  async findRandom(): Promise<Product[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('*')
      .orderBy('RAND()')
      .take(4)
      .getRawMany();

    return result;
  }

  // 카테고리별로 상품 검색
  async findCategory({ product_category }): Promise<Product[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('*')
      .where('category LIKE "%":category"%"', { product_category })
      .orderBy('product.product_createdAt', 'DESC')
      .getRawMany();

    return result;
  }

  // 신규유저의 상품 검색(work,Rate가 0인 사람들의 상품을 랜덤으로3개 가져온다)
  async findNewUser(): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u')
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'u.user_nickname',
      ])
      .where('u.user_workRate = :user_workRate', { user_workRate: 0 })
      .limit(3)
      .orderBy('RAND()')
      .getRawMany();
    console.log(result);
    return result;
  }

  // 특정상품에 대한 내용만 검색
  findOne({ product_id }: IProductServiceFindOne): Promise<Product> {
    return this.productsRepository.findOne({
      where: { product_id },
    });
  }

  // 상품 작성하기
  async create({
    createProductInput,
    user_id,
  }: IProductServiceCreate): Promise<Product> {
    const { product_thumbnailImage, product_isMain, ...rest } =
      createProductInput;
    const result = await this.productsRepository.save({
      ...rest,
      user: { user_id },
    });

    const tagUrls = product_thumbnailImage;
    const tagIsMains = product_isMain;

    const productId = result.product_id;

    const image = [];

    for (let i = 0; i < tagUrls.length; i++) {
      image.push({
        product: productId,
        image_isMain: tagIsMains[i],
        image_url: tagUrls[i],
        image_isThumbnail: true,
      });
    }

    await this.imagesRepository.insert(image);
    return result;
  }

  // 상품 수정 & 업데이트하기
  async update({
    product_id,
    updateProductInput,
  }: IProductServiceUpdate): Promise<boolean> {
    const result = await this.productsRepository.update(
      {
        product_id,
      },
      {
        ...updateProductInput,
      },
    );

    return result ? true : false;
  }

  // 상품 삭제하기
  async delete({ product_id }: IProductServiceDelete): Promise<boolean> {
    const result = await this.productsRepository.softDelete({ product_id });
    return result.affected ? true : false; //
  }
}
