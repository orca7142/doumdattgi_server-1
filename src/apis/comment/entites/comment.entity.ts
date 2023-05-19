import { Field, ObjectType } from '@nestjs/graphql';
import { Request } from 'src/apis/request/entites/request.entity';
import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  comment_id: string;

  @ManyToOne(() => Request)
  @Field(() => Request)
  request: Request;
}
