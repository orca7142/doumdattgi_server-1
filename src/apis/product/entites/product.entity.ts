import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PRODUCT_CATEGORY_ENUM {
  IT = 'IT',
  DESIGN = 'DESIGN',
  TRANSLATE = 'TRANSLATE',
  VIDEO = 'VIDEO',
  MARKETING = 'MARKETING',
  DOCUMENT = 'DOCUMENT',
}

registerEnumType(PRODUCT_CATEGORY_ENUM, {
  name: 'PRODUCT_CATEGORY_ENUM',
});

@Entity()
@ObjectType()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @ManyToOne(() => User)
  @Field(() => User)
  user: User;

  @Column({ type: 'enum', enum: PRODUCT_CATEGORY_ENUM })
  @Field(() => PRODUCT_CATEGORY_ENUM)
  title: string;

  @Column()
  @Field(() => String)
  category: string;

  @Column()
  @Field(() => String)
  summary: string;

  @Column()
  @Field(() => String)
  main_text: string;

  @Column()
  @Field(() => Boolean)
  sellOrBuy: boolean;
}
