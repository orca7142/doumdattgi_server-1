import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Image } from 'src/apis/image/entites/image.entity';
import { Pick } from 'src/apis/pick/entites/pick.entity';
import { Coupon } from 'src/apis/coupon/entities/coupon.entity';

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
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  product_id: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @OneToMany(() => Image, (image) => image.product)
  @Field(() => [Image])
  images: Image[];

  @OneToMany(() => Pick, (pick) => pick.product)
  @Field(() => [Pick])
  pick: Pick[];

  @Column()
  @Field(() => String)
  product_title: string;

  @Column({ type: 'enum', enum: PRODUCT_CATEGORY_ENUM })
  @Field(() => PRODUCT_CATEGORY_ENUM)
  product_category: string;

  @Column()
  @Field(() => String)
  product_sub_category: string;

  @Column()
  @Field(() => String)
  product_summary: string;

  @Column({ type: 'text' })
  @Field(() => String)
  product_main_text: string;

  @Column()
  @Field(() => Boolean)
  product_sellOrBuy: boolean;

  @CreateDateColumn()
  product_createdAt: Date;

  @Column({ type: 'enum', enum: WORKDAY_STATUS_ENUM })
  @Field(() => WORKDAY_STATUS_ENUM)
  product_workDay: string;

  @Column()
  @Field(() => Int)
  product_startTime: number;

  @Column()
  @Field(() => Int)
  product_endTime: number;

  @Column()
  @Field(() => Int)
  product_workTime: number;

  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  product_postNum?: string;

  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  product_roadAddress?: string;

  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  product_detailAddress?: string;

  @DeleteDateColumn()
  @Field(() => Date, { nullable: true })
  product_deletedAt: Date;

  @JoinColumn()
  @OneToOne(() => Coupon, (coupon) => coupon.product)
  @Field(() => Coupon)
  coupon: Coupon;
}
