import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Pick {
  // 찜 아이디
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  pick_id: string;

  @OneToMany(() => Product, (product) => product.pick)
  @Field(() => Product)
  product: Product;

  @ManyToOne(() => User)
  @Field(() => [User])
  user: User[];

  // 찜 상태
  @Column({ default: false })
  @Field(() => Boolean, { nullable: true })
  pick_status: boolean;
}
