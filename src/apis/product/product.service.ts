import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entites/product.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import {
  IProductServiceCreate,
  IProductServiceDelete,
  IProductServiceFetchMyNotCouponProduct,
  IProductServiceFindAll,
  IProductServiceFindCategory,
  IProductServiceFindOne,
  IProductServiceFindSearch,
  IProductServiceFindSellProduct,
  IProductServiceFindSubCategory,
  IProductServiceFindUserAll,
  IProductServiceUpdate,
} from './interfaces/product-service.interface';
import { User } from '../users/entities/user.entity';
import { Image } from '../image/entites/image.entity';
import { FetchProductOutput } from './dto/fetch-product.output';
import { FetchSubCategoryOutput } from './dto/fetch-subCategory.output';
import { FetchSearchProductOutput } from './dto/fetch-SearchProduct.output';
import { Slot } from '../slot/entites/slot.entity';
import { FetchLikeCategoryOutput } from './dto/fetch-LikeCategory.output';
import { FetchLikeSubCategoryOutput } from './dto/fetch-LikeSubCategory.output';

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

  // 모든 게시물 검색
  async findAll({
    page,
    pageSize,
  }: IProductServiceFindAll): Promise<FetchProductOutput[]> {
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
        'product.product_minAmount',
        'product.product_possibleAmount',
        'product.product_date',
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

  // 모든 유저의 게시글 검색
  async findUserAll({
    user_id,
    page,
    pageSize,
  }: IProductServiceFindUserAll): Promise<Product[]> {
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

  // 최신 게시물 검색(8개만)
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
        'product.product_minAmount',
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

  // 랜덤 조회(4개만)
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
        'product.product_minAmount',
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

  // 구인글 검색 4개만 (메인페이지)
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

  // 검색하기
  async findSearch({
    search,
    page,
    pageSize,
  }: IProductServiceFindSearch): Promise<FetchSearchProductOutput[]> {
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

  // 카테고리 검색
  async findCategory({
    product_category,
    page,
    pageSize,
  }: IProductServiceFindCategory): Promise<FetchProductOutput[]> {
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

  // 좋아요 많은 순으로 보기(리스트페이지: 카테고리)
  async findLikeCategory({
    product_category,
    page,
    pageSize,
  }: IProductServiceFindCategory): Promise<FetchLikeCategoryOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .leftJoinAndSelect('product.pick', 'pick')
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_nickname',
        'u.user_profileImage',
        'MAX(i.image_url) as image_url',
        'COUNT(pick.pick_id) as pick_count',
      ])
      .where('product_category LIKE "%":product_category"%"', {
        product_category,
      })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 1,
      })
      .groupBy('product.product_id')
      .orderBy('COUNT(pick.pick_id)', 'DESC')
      .addOrderBy('product.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    return result;
  }

  // 서브 카테고리 검색
  async findSubCategory({
    product_sub_category,
    page,
    pageSize,
  }: IProductServiceFindSubCategory): Promise<FetchSubCategoryOutput[]> {
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

  // 좋아요 많은 순으로 보기(리스트페이지: 서브 카테고리)
  async findLikeSubCategory({
    product_sub_category,
    page,
    pageSize,
  }: IProductServiceFindSubCategory): Promise<FetchLikeSubCategoryOutput[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .innerJoin('product.user', 'u', 'product.userUserId = u.user_Id')
      .innerJoin(
        'product.images',
        'i',
        'product.product_id = i.productProductId',
      )
      .leftJoinAndSelect('product.pick', 'pick')
      .select([
        'product.product_id',
        'product.product_title',
        'product.product_category',
        'product.product_sub_category',
        'product.product_workDay',
        'product.product_sellOrBuy',
        'u.user_nickname',
        'u.user_profileImage',
        'MAX(i.image_url) as image_url',
        'COUNT(pick.pick_id) as pick_count',
      ])
      .where('product_sub_category = :product_sub_category', {
        product_sub_category,
      })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 1,
      })
      .groupBy('product.product_id')
      .orderBy('COUNT(pick.pick_id)', 'DESC')
      .addOrderBy('product.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    return result;
  }

  // 구해요 페이지 검색 (카테고리, 리스트)
  async findSellProduct({
    product_category,
    page,
    pageSize,
  }: IProductServiceFindSellProduct): Promise<FetchProductOutput[]> {
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
        'product.product_possibleAmount',
        'product.product_date',
        'u.user_profileImage',
        'u.user_nickname',
        'i.image_url',
      ])
      .where('product_category LIKE "%":product_category"%"', {
        product_category,
      })
      .andWhere('i.image_isMain = :image_isMain', { image_isMain: 1 })
      .andWhere('product.product_sellOrBuy = :product_sellOrBuy', {
        product_sellOrBuy: 0,
      })
      .orderBy('product.product_createdAt', 'DESC')
      .limit(pageSize)
      .offset(pageSize * (page - 1))
      .getRawMany();

    return result;
  }

  // 숨은 보석 찾기(메인페이지)
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

  // 디테일 페이지
  async findOne({ product_id }: IProductServiceFindOne): Promise<Product> {
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

  async delete({
    product_id,
    user_id,
  }: IProductServiceDelete): Promise<boolean> {
    const product = await this.productsRepository.findOne({
      where: { user: { user_id }, product_id },
      relations: ['user'],
    });
    console.log(product);

    if (!product)
      throw new Error(
        '상품을 찾을수 없습니다. product_id를 확인하거나. 본인의 게시물인지 확인하세요',
      );

    try {
      const result = await this.productsRepository.softDelete({ product_id });
      return result.affected ? true : false;
    } catch (error) {
      throw new Error('삭제에 실패하였습니다.');
    }
  }

  // 나의 상단노출권 적용 안된 상품 조회 함수
  async fetchMyNotCouponProduct({
    user_id,
  }: IProductServiceFetchMyNotCouponProduct): Promise<Product[]> {
    const result = [];
    const product = await this.productsRepository.find({
      where: { user: { user_id } },
      relations: ['mileage'],
    });

    for (let i = 0; i < product.length; i++) {
      if (!product[i].mileage && product[i].product_sellOrBuy)
        result.push(product[i]);
    }

    return result;
  }
}
