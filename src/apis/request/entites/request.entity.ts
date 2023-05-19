import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum REQUEST_ISACCEPT_ENUM {
  WAITING = 'WAITING',
  ACCEPT = 'ACCEPT',
  REFUSE = 'REFUSE',
  FINISH = 'FINISH',
}

registerEnumType(REQUEST_ISACCEPT_ENUM, {
  name: 'REQUEST_ISACCEPT_ENUM',
});

@Entity()
@ObjectType()
export class Request {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  request_id: string;

  @JoinColumn()
  @OneToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column({ type: 'enum', enum: REQUEST_ISACCEPT_ENUM })
  @Field(() => REQUEST_ISACCEPT_ENUM)
  request_isAccept: REQUEST_ISACCEPT_ENUM;

  // @Column()
  // @Field(() => String)
  // request_seller: string;

  @Column()
  @Field(() => Int)
  request_price: number;

  @CreateDateColumn()
  @Field(() => Date)
  request_createAt: Date;

  @Column({ default: null })
  @Field(() => Date)
  request_sentAt: Date;

  @Column({ default: null })
  @Field(() => Date)
  request_completedAt: Date;

  @Column()
  @Field(() => String)
  request_title: string;

  @Column()
  @Field(() => String)
  request_content: string;

  // @Column({ default: null })
  // @Field(() => [String])
  // images: string[];
}
