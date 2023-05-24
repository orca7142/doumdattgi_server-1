import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Payment } from 'src/apis/payment/entities/payment.entity';
import { Product } from 'src/apis/product/entites/product.entity';
import { Slot } from 'src/apis/slot/entites/slot.entity';

import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class User {
  // 유저ID
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  user_id: string;

  @OneToMany(() => Payment, (Payment) => Payment.user)
  @Field(() => [Payment])
  payment: Payment[];

  @OneToMany(() => Product, (Product) => Product.user)
  @Field(() => [Product])
  product: Product[];

  // 이메일 주소
  @Column()
  @Field(() => String)
  user_email: string;

  // 비밀번호
  @Column()
  @Field(() => String)
  user_password: string;

  // 이름
  @Column()
  @Field(() => String)
  user_name: string;

  // 닉네임
  @Column()
  @Field(() => String)
  user_nickname: string;

  // 휴대전화 번호
  @Column()
  @Field(() => String)
  user_phone: string;

  // 프로필 이미지
  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  user_profileImage: string;

  // 자기소개
  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  user_introduce: string;

  // 포트폴리오 주소
  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  user_portfolio: string;

  // 작업통계
  @Column({ default: 0 })
  @Field(() => Int)
  user_workRate: number;

  // 포인트
  @Column({ default: 0 })
  @Field(() => Int)
  user_point: number;

  // 회원탈퇴 시간
  @DeleteDateColumn()
  user_deletedAt: Date;

  @OneToMany(() => Slot, (slot) => slot.user)
  @Field(() => Slot)
  slot: Slot;
}
