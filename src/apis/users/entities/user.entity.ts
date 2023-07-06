import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Mileage } from 'src/apis/mileage/entities/mileage.entity';
import { Payment } from 'src/apis/payment/entities/payment.entity';
import { Product } from 'src/apis/product/entites/product.entity';
import { Slot } from 'src/apis/slot/entites/slot.entity';

import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  user_id: string;

  @OneToMany(() => Payment, (Payment) => Payment.user)
  @Field(() => [Payment])
  payment: Payment[];

  @OneToMany(() => Product, (Product) => Product.user)
  @Field(() => [Product])
  product: Product[];

  @OneToMany(() => Mileage, (Mileage) => Mileage.user)
  @Field(() => [Mileage])
  mileage: Mileage[];

  @Column()
  @Field(() => String)
  user_email: string;

  @Column()
  @Field(() => String)
  user_password: string;

  @Column()
  @Field(() => String)
  user_name: string;

  @Column()
  @Field(() => String)
  user_nickname: string;

  @Column()
  @Field(() => String)
  user_phone: string;

  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  user_profileImage: string;

  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  user_introduce: string;

  @Column({ default: '' })
  @Field(() => String, { nullable: true })
  user_portfolio: string;

  @Column({ default: 0 })
  @Field(() => Int)
  user_workRate: number;

  @Column({ default: 0 })
  @Field(() => Int)
  user_point: number;

  @Column({ default: 0 })
  @Field(() => Int)
  user_mileage: number;

  @DeleteDateColumn()
  user_deletedAt: Date;

  @OneToOne(() => Slot, (slot) => slot.user)
  @Field(() => Slot)
  slot: Slot;
}
