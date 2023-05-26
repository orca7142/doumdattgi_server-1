import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entites/product.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  IProductServiceCreate,
  IProductServiceDelete,
  IProductServiceUpdate,
} from './interfaces/product-service.interface';
import { User } from '../users/entities/user.entity';
import { Image } from '../image/entites/image.entity';
import { FetchProductOutput } from './dto/fetch-product.output';
import { FetchSubCategoryOutput } from './dto/fetch-subCategoty.output';
import { FetchSearchProductOutput } from './dto/fetch-SearchProduct.output';
import { Slot } from '../slot/entites/slot.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Image)
    private readonly imagesRepository: Repository<Image>, //

    @InjectRepository(Slot)
    private readonly slotsRepository: Repository<Slot>,

    private readonly usersService: UsersService,
  ) {}

  // 모든 상품 검색(페이지로 검색 & 최신순으로 검색), <리스트: 전체 리스트>
  async findAll({ page, pageSize }): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'u.user_nickname',
        'u.user_profileImage',
        'i.image_url',
      ])
      .where('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .orderBy('product.product_createdAt', 'DESC')
      .offset(pageSize * (page - 1))
      .limit(pageSize)
      .getRawMany();

    return result;
  }

  // 나의 상품 모두 검색 <마이페이지>
  async findUserAll({ user_id, page, pageSize }): Promise<Product[]> {
    const result = await this.productsRepository.find({
      where: {
        user: { user_id },
        images: { image_isMain: true },
      },
      relations: ['user', 'images'],
      order: { product_createdAt: 'DESC' },
      skip: pageSize * (page - 1),
      take: pageSize,
    });
    return result;
  }

  // 모든 상품 중 최신게시글 검색(8개만), <메인페이지: 최신 게시글>
  async findAllProduct(): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_profileImage',
        'u.user_nickname',
        'i.image_url',
      ])
      .where('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 1,
      })
      .orderBy('product.product_createdAt', 'DESC')
      .limit(8)
      .getRawMany();

    return result;
  }

  // 랜덤 4개 상품 검색 <메인페이지: 숨은보석 게시글>
  async findRandom(): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_nickname',
        'u.user_profileImage',
        'i.image_url',
      ])
      .where('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 1,
      })
      .orderBy('RAND()')
      .limit(4)
      .getRawMany();

    return result;
  }

  // 구인글 검색 <메인페이지: 지금 구하고 있는 구인글>
  async findSell(): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_nickname',
        'u.user_profileImage',
        'i.image_url',
      ])
      .where('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 0,
      })
      .orderBy('RAND()')
      .limit(4)
      .getRawMany();

    return result;
  }

  // 검색기능(title, category, summary로 검색)
  async findSearch({
    search,
    page,
    pageSize,
  }): Promise<FetchSearchProductOutput[]> {
    if (!search) {
      throw new Error('Title is required for search.');
    }

    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'product.product_summary',
        'u.user_nickname',
        'u.user_profileImage',
        'i.image_url',
      ])
      .where('product.product_title LIKE :search', { search: `%${search}%` })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 1,
      })
      .orderBy('product.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    return result;
  }

  // 카테고리별로 상품 검색 <리스트페이지: 구해요 빼고 나머지>
  async findCategory({
    product_category,
    page,
    pageSize,
  }): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_nickname',
        'u.user_profileImage',
        'i.image_url',
      ])
      .where('product_category LIKE "%":product_category"%"', {
        product_category,
      })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 1,
      })
      .orderBy('product.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    return result;
  }

  // 카테고서브리별로 상품 검색 <리스트페이지: 구해요 빼고 나머지>
  async findSubCategory({
    product_category,
    product_sub_category,
    page,
    pageSize,
  }): Promise<FetchSubCategoryOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_sub_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_nickname',
        'u.user_profileImage',
        'i.image_url',
      ])
      .where('product_sub_category = :product_sub_category', {
        product_sub_category,
      })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 1,
      })
      .orderBy('product.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    return result;
  }

  // 구해요 카테고리 상품 검색 <리스트 페이지: 구해요>
  async findSellProduct({ page, pageSize }): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_profileImage',
        'u.user_nickname',
        'i.image_url',
      ])
      .where('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 0,
      })
      .orderBy('product.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    return result;
  }

  // 신규유저의 상품 검색(work,Rate가 0인 사람들의 상품을 랜덤으로3개 가져온다), <메인페이지: 신규@@님의 첫게시물>
  async findNewUser(): Promise<FetchProductOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_nickname',
        'u.user_profileImage',
        'i.image_url',
      ])
      .where('u.user_workRate = :user_workRate', { user_workRate: 0 })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 1,
      })
      .limit(3)
      .orderBy('RAND()')
      .getRawMany();

    return result;
  }

  // 구인 글 검색<디테일 페이지>
  // 특정상품에 대한 내용만 검색
  async findOne({ product_id, user_id }): Promise<Product> {
    const productUserId = (
      await this.productsRepository.findOne({
        where: { product_id },
        relations: ['user'],
      })
    ).user.user_id;

    const userSlot = await this.slotsRepository.findOne({
      where: { user: { user_id: productUserId } },
      relations: ['user'],
    });

    if (userSlot === null) {
      const createSlot = await this.slotsRepository.create({
        user: { user_id: productUserId },
        slot_first: false,
        slot_second: false,
        slot_third: false,
      });
      await this.slotsRepository.save({
        ...createSlot,
      });
    } else {
      const result = await this.productsRepository.findOne({
        where: { product_id },
        relations: ['images', 'user', 'user.slot'],
      });
      return result;
    }
  }

  // 상품 작성하기
  async create({
    createProductInput,
    user_id,
  }: IProductServiceCreate): Promise<Product> {
    const { product_thumbnailImage, ...rest } = createProductInput;

    const result = await this.productsRepository.save({
      ...rest,
      user: { user_id },
    });
    const productId = result.product_id;
    const image = [];

    for (let i = 0; i < product_thumbnailImage.length; i++) {
      const tagUrls = product_thumbnailImage[i].thumbnailImage;
      const tagIsMains = product_thumbnailImage[i].isMain;

      image.push({
        product: productId,
        image_isMain: tagIsMains,
        image_url: tagUrls,
      });
    }
    await this.imagesRepository.insert(image);

    const result2 = await this.productsRepository.findOne({
      where: { product_id: result.product_id },
      relations: ['user', 'images'],
    });

    return result2;
  }

  // 상품 수정 & 업데이트하기
  async update({
    product_id,
    updateProductInput,
  }: IProductServiceUpdate): Promise<boolean> {
    const image = [];
    const { product_thumbnailImage, ...rest } = updateProductInput;

    if (!product_thumbnailImage.length) {
      const result = await this.productsRepository.update(
        {
          product_id,
        },
        {
          ...rest,
        },
      );
      return result ? true : false;
    } else {
      for (let i = 0; i < product_thumbnailImage.length; i++) {
        const tagUrls = product_thumbnailImage[i].thumbnailImage;
        const tagIsMains = product_thumbnailImage[i].isMain;

        image.push({
          product: { product_id },
          image_isMain: tagIsMains,
          image_url: tagUrls,
        });
        const findImage = await this.imagesRepository.find({
          where: { product: { product_id } },
        });

        for (let k = 0; k < findImage.length; k++) {
          const image_id = findImage[k].image_id;
          await this.imagesRepository.delete({ image_id });
        }

        for (let j = 0; j < image.length; j++) {
          await this.imagesRepository.save({
            product: { product_id },
            image_isMain: image[j].image_isMain,
            image_url: image[j].image_url,
          });
        }
      }
      const result = await this.productsRepository.update(
        {
          product_id,
        },
        {
          ...rest,
        },
      );
      return result ? true : false;
    }
  }

  async delete({ product_id }: IProductServiceDelete): Promise<boolean> {
    const product = await this.productsRepository.findOne({
      where: { product_id },
    });

    console.log(product);
    if (!product)
      throw new Error('상품을 찾을수 없습니다. product_id를 확인하세요');

    try {
      const result = await this.productsRepository.softDelete({ product_id });
      return result.affected ? true : false;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw new Error('삭제에 실패하였습니다.');
    }
  }
}
