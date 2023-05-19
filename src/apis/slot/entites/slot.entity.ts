// import { Field, ObjectType } from '@nestjs/graphql';
// import { User } from 'src/apis/users/entities/user.entity';
// import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

// @Entity()
// @ObjectType()
// export class PointTransaction {
//   @PrimaryGeneratedColumn('uuid')
//   @Field(() => String)
//   slot_id: string;

//   @ManyToOne(() => User)
//   @Field(() => User)
//   user: User;

//   @Column()
//   @Field(() => Boolean)
//   slot_first: boolean;

//   @Column()
//   @Field(() => Boolean)
//   slot_second: boolean;

//   @Column()
//   @Field(() => Boolean)
//   slot_third: boolean;
// }
