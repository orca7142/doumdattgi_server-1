import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
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

  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @Column()
  @Field(() => String)
  seller_id: string;

  @Column()
  @Field(() => String)
  seller_nickname: string;

  @Column()
  @Field(() => String)
  seller_profileImage: string;

  @Column()
  @Field(() => String)
  seller_email: string;

  @Column()
  @Field(() => String)
  buyer_id: string;

  @Column()
  @Field(() => String)
  buyer_nickname: string;

  @Column()
  @Field(() => String)
  buyer_profileImage: string;

  @Column()
  @Field(() => String)
  buyer_email: string;

  @Column({ type: 'enum', enum: REQUEST_ISACCEPT_ENUM })
  @Field(() => REQUEST_ISACCEPT_ENUM)
  request_isAccept: REQUEST_ISACCEPT_ENUM;

  @Column()
  @Field(() => Int)
  request_price: number;

  @CreateDateColumn()
  @Field(() => Date)
  request_createAt: Date;

  @Column({ default: null })
  @Field(() => Date, { nullable: true })
  request_startAt: Date;

  @Column({ default: null })
  @Field(() => Date, { nullable: true })
  request_sendAt: Date;

  @Column({ default: null })
  @Field(() => Date, { nullable: true })
  request_completedAt: Date;

  @Column()
  @Field(() => String)
  request_title: string;

  @Column({ type: 'text' })
  @Field(() => String)
  request_content: string;

  @Column()
  @Field(() => Date)
  request_dueDate: Date;
}
