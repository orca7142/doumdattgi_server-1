import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
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

export enum MILEAGE_STATUS_ENUM {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

registerEnumType(MILEAGE_STATUS_ENUM, {
  name: 'MILEAGE_STATUS_ENUM',
});

export enum COUPON_TYPE_ENUM {
  ONE_DAY = 'ONE_DAY',
  THREE_DAYS = 'THREE_DAYS',
  SEVEN_DAYS = 'SEVEN_DAYS',
  NONE = 'NONE',
}

registerEnumType(COUPON_TYPE_ENUM, {
  name: 'COUPON_TYPE_ENUM',
});

@Entity()
@ObjectType()
export class Mileage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  mileage_id: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column({ type: 'enum', enum: MILEAGE_STATUS_ENUM })
  @Field(() => MILEAGE_STATUS_ENUM)
  mileage_status: string;

  @Column({ type: 'enum', enum: COUPON_TYPE_ENUM })
  @Field(() => COUPON_TYPE_ENUM, { nullable: true })
  mileage_coupon: string;

  @Column()
  @Field(() => Int)
  payment_amount: number;

  @CreateDateColumn()
  @Field(() => Date)
  mileage_createdAt: Date;

  @OneToOne(() => Product, (product) => product.user)
  @Field(() => Product)
  product: Product;
}
