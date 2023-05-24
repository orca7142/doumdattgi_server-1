import { Field, ObjectType } from '@nestjs/graphql';
import { Request } from 'src/apis/request/entites/request.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  comment_id: string;

  @ManyToOne(() => Request)
  @Field(() => Request)
  request: Request;

  @Column()
  @Field(() => String)
  comment_text: string;

  @Column()
  @Field(() => String)
  comment_sellerOrBuyer: string;

  @CreateDateColumn()
  comment_createdAt: Date;
}
