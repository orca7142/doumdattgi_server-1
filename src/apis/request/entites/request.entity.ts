import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Request {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @JoinColumn()
  @OneToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @ManyToOne(() => User)
  @Field(() => User)
  user = User;

  @Column()
  @Field(() => Boolean)
  isAccept: boolean;

  @Column()
  @Field(() => Int)
  price: number;

  @Column()
  @Field(() => Date)
  createAt: Date;

  @Column()
  @Field(() => Date)
  sentAt: Date;

  @Column()
  @Field(() => Date)
  completedAt: Date;

  @Column()
  @Field(() => String)
  req_title: string;

  @Column()
  @Field(() => String)
  content: string;
}
