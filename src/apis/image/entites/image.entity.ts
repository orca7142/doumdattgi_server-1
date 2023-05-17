import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @Column()
  @Field(() => Boolean)
  isMain: boolean;

  @Column()
  @Field(() => Boolean)
  isThumbnail: boolean;

  @Column()
  @Field(() => String)
  url: string;
}
