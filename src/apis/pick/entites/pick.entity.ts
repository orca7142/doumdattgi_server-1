import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
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
  @Field(() => String, { nullable: true })
  pick_id: string;

  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @ManyToOne(() => User)
  @Field(() => User, { nullable: true })
  user: User;

  // 찜 상태
  @Column({ default: false })
  @Field(() => Boolean, { nullable: true })
  pick_status: boolean;
}
