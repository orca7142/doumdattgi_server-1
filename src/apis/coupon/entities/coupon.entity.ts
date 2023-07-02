import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum COUPON_TYPE_ENUM {
  ONE_DAY = 'ONE_DAY',
  THREE_DAYS = 'THREE_DAYS',
  SEVEN_DAYS = 'SEVEN_DAYS',
}

registerEnumType(COUPON_TYPE_ENUM, {
  name: 'COUPON_TYPE_ENUM',
});

@Entity()
@ObjectType()
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  coupon_id: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column({ type: 'enum', enum: COUPON_TYPE_ENUM })
  @Field(() => COUPON_TYPE_ENUM)
  coupon_type: string;

  @Column({ default: false })
  @Field(() => Boolean)
  coupon_isUsed: boolean;

  @OneToOne(() => Product, (product) => product.coupon)
  @Field(() => Product)
  product: Product;

  @CreateDateColumn()
  @Field(() => Date)
  coupon_createdAt: Date;
}
