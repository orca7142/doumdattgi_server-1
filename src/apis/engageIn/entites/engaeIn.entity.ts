import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Request } from 'src/apis/request/entites/request.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class engageIn {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  @JoinColumn()
  @OneToOne(() => Request)
  @Field(() => Request)
  request: Request;

  @Column()
  @Field(() => Int)
  price: number;
}
