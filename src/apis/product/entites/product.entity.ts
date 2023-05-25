import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Image } from 'src/apis/image/entites/image.entity';

export enum PRODUCT_CATEGORY_ENUM {
  IT = 'IT',
  DESIGN = 'DESIGN',
  TRANSLATE = 'TRANSLATE',
  VIDEO = 'VIDEO',
  MARKETING = 'MARKETING',
  DOCUMENT = 'DOCUMENT',
}

export enum WORKDAY_STATUS_ENUM {
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND',
  NEGOTIATION = 'NEGOTIATION',
}

registerEnumType(PRODUCT_CATEGORY_ENUM, {
  name: 'PRODUCT_CATEGORY_ENUM',
});

registerEnumType(WORKDAY_STATUS_ENUM, {
  name: 'WORKDAY_STATUS_ENUM',
});

@Entity()
@ObjectType()
export class Product {
  // 상품 ID
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  product_id: string;

  // 유저 정보
  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @OneToMany(() => Image, (image) => image.product)
  @Field(() => [Image])
  images: Image[];

  // 제목
  @Column()
  @Field(() => String)
  product_title: string;

  // 카테고리
  @Column({ type: 'enum', enum: PRODUCT_CATEGORY_ENUM })
  @Field(() => PRODUCT_CATEGORY_ENUM)
  product_category: string;

  // 서브 카테고리
  @Column()
  @Field(() => String)
  product_sub_category: string;

  // 요약
  @Column()
  @Field(() => String)
  product_summary: string;

  // 본문
  @Column({ type: 'text' })
  @Field(() => String)
  product_main_text: string;

  // 구해요/팔아요
  @Column()
  @Field(() => Boolean)
  product_sellOrBuy: boolean;

  // 생성 날짜
  @CreateDateColumn()
  product_createdAt: Date;

  // 작업 가능 날짜(주중 / 주말 / 협의)
  @Column({ type: 'enum', enum: WORKDAY_STATUS_ENUM })
  @Field(() => WORKDAY_STATUS_ENUM)
  product_workDay: string;

  // 시작 작업 가능 시간
  @Column()
  @Field(() => Int)
  product_startTime: number;

  // 종료 작업 가능 시간
  @Column()
  @Field(() => Int)
  product_endTime: number;

  // 작업한 시간
  @Column()
  @Field(() => Int)
  product_workTime: number;

  // 우편번호
  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  product_postNum?: string;

  // 도로명 주소
  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  product_roadAddress?: string;

  // 상세주소
  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  product_detailAddress?: string;

  // 삭제시간
  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  product_deletedAt: Date;
}
