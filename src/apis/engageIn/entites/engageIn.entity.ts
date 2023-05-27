import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Request } from 'src/apis/request/entites/request.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ENGAGEIN_STATUS_ENUM {
  WAITING = 'WAITING',
  ACCEPT = 'ACCEPT',
  REFUSE = 'REFUSE',
  FINISH = 'FINISH',
}

registerEnumType(ENGAGEIN_STATUS_ENUM, {
  name: 'ENGAGEIN_STATUS_ENUM',
});

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

  @Column({ type: 'enum', enum: ENGAGEIN_STATUS_ENUM })
  @Field(() => ENGAGEIN_STATUS_ENUM)
  engageIn_status: ENGAGEIN_STATUS_ENUM;
}
