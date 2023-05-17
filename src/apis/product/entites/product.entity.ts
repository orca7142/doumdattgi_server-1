import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PRODUCT_CATEGORY_ENUM {
  IT = 'IT',
  DESIGN = 'DESIGN',
  TRANSLATE = 'TRANSLATE',
  VIDEO = 'VIDEO',
  MARKETING = 'MARKETING',
  DOCUMENT = 'DOCUMENT',
}

registerEnumType(PRODUCT_CATEGORY_ENUM, {
  name: 'PRODUCT_CATEGORY_ENUM',
});

@Entity()
@ObjectType()
export class Product {
  // 상품 ID
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  // 유저 정보
  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  // 제목
  @Column()
  @Field(() => String)
  title: string;

  // 카테고리
  @Column({ type: 'enum', enum: PRODUCT_CATEGORY_ENUM })
  @Field(() => PRODUCT_CATEGORY_ENUM)
  category: string;

  // 서브 카테고리
  @Column()
  @Field(() => String)
  sub_category: string;

  // 요약
  @Column()
  @Field(() => String)
  summary: string;

  // 본문
  @Column()
  @Field(() => String)
  main_text: string;

  // 구해요/팔아요
  @Column()
  @Field(() => Boolean)
  sellOrBuy: boolean;

  // 생성 날짜
  @CreateDateColumn()
  createdAt: Date;
}
