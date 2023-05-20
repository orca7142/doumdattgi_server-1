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
import { HttpExceptionFilter } from 'src/commons/filter/http-exception.filter';
import { FetchOneProductOutput } from './dto/fetch-product.output';

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
  async findAll({ page, pageSize }): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u')
      .innerJoin('product.images', 'i')
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'u.user_nickname',
        'i.image_url',
      ])
      .where('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .orderBy('product.product_createdAt', 'DESC')
      .offset(pageSize * (page - 1))
      .limit(pageSize)
      .getRawMany();

    return result;
  }

  // 랜덤 4개 상품 검색
  async findRandom(): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u')
      .innerJoin('product.images', 'i')
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'u.user_nickname',
        'i.image_url',
      ])
      .where('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .orderBy('RAND()')
      .take(4)
      .getRawMany();

    return result;
  }

  // 카테고리별로 상품 검색
  async findCategory({
    product_category,
    page,
    pageSize,
  }): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u')
      .innerJoin('product.images', 'i')
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'u.user_nickname',
        'i.image_url',
      ])
      .where('product_category LIKE "%":product_category"%"', {
        product_category,
      })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .orderBy('product.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    return result;
  }

  // 신규유저의 상품 검색(work,Rate가 0인 사람들의 상품을 랜덤으로3개 가져온다)
  async findNewUser(): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      // .innerJoin('user', 'u', 'product.userUserId = u.user_id')
      // .innerJoin('images', 'i', 'product.product_id = i.productProductId')
      .innerJoin('product.user', 'u')
      .innerJoin('product.images', 'i')
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'u.user_nickname',
        'i.image_url',
      ])
      .where('u.user_workRate = :user_workRate', { user_workRate: 0 })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .limit(3)
      .orderBy('RAND()')
      .getRawMany();

    return result;
  }

  // 구인 글 검색
  // 특정상품에 대한 내용만 검색
  // async findOne({ product_product_id }: FetchOneProductOutput): Promise<FetchOneProductOutput> {

  //   const result = await this.productsRepository
  //     .createQueryBuilder('product')
  //     .innerJoin('product.user', 'u')
  //     .innerJoin('product.images', 'i')
  //     .select([
  //       'product.product_id',
  //       'product.product_title',
  //       'product.product_category',
  //       'product.product_workDay',
  //       'product.product_summary',
  //       'product.product_main_text',
  //       'u.user_nickname',
  //       'u.user_workRate',
  //       'u.user_portfolio',
  //       'u.user_introduce',
  //       'i.image_url',
  //     ]);
  //     .orderBy('product.product_createdAt', 'DESC')
  //     .getRawMany();

  //     return result
  // }

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
