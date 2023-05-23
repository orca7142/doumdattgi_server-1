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
export class EngageIn {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  engageIn_id: string;

  @JoinColumn()
  @OneToOne(() => Request)
  @Field(() => Request)
  request: Request;

  @Column()
  @Field(() => Int)
  engageIn_price: number;
}
