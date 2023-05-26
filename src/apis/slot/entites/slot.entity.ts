import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/apis/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class Slot {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  slot_id: string;

  @JoinColumn()
  @OneToOne(() => User, (user) => user.slot)
  @Field(() => User)
  user: User;

  @Column({ default: false })
  @Field(() => Boolean)
  slot_first: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  slot_second: boolean;

  @Column({ default: false })
  @Field(() => Boolean)
  slot_third: boolean;
}
