import { Field, ObjectType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  image_id: string;

  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @Column()
  @Field(() => Boolean)
  image_isMain: boolean;

  @Column()
  @Field(() => Boolean)
  image_isThumbnail: boolean;

  @Column()
  @Field(() => String)
  image_url: string;
}
