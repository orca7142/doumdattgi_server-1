import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @Column()
  @Field(() => String)
  postNum: string;

  @Column()
  @Field(() => String)
  roadAddress: string;

  @Column()
  @Field(() => String)
  detailAddress: string;
}
