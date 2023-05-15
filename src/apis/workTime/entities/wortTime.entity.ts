import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Product } from 'src/apis/product/entites/product.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

export enum WORKTIME_STATUS_ENUM {
  WEEKDAY = 'WEEKDAY',
  WEEKEND = 'WEEKEND',
  NEGOTIATION = 'NEGOTIATION',
}

registerEnumType(WORKTIME_STATUS_ENUM, {
  name: 'WORKTIME_STATUS_ENUM',
});
@Entity()
@ObjectType()
export class WorTime {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @ManyToOne(() => Product)
  @Field(() => Product)
  product: Product;

  @Column({ type: 'enum', enum: WORKTIME_STATUS_ENUM })
  @Field(() => WORKTIME_STATUS_ENUM)
  week: string;

  @Column()
  @Field(() => String)
  start_time: string;

  @Column()
  @Field(() => String)
  end_time: string;
}
