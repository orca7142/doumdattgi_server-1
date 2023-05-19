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
  id: string;

  @JoinColumn()
  @OneToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column({ type: 'enum', enum: REQUEST_ISACCEPT_ENUM })
  @Field(() => REQUEST_ISACCEPT_ENUM)
  isAccept: REQUEST_ISACCEPT_ENUM;

  @Column()
  @Field(() => String)
  seller: string;

  @Column()
  @Field(() => Int)
  price: number;

  @CreateDateColumn()
  @Field(() => Date)
  createAt: Date;

  @Column({ default: null })
  @Field(() => Date)
  sentAt: Date;

  @Column({ default: null })
  @Field(() => Date)
  completedAt: Date;

  @Column()
  @Field(() => String)
  title: string;

  @Column()
  @Field(() => String)
  content: string;

  // @Column({ default: null })
  // @Field(() => [String])
  // images: string[];
}
