// import { Field, ObjectType } from '@nestjs/graphql';
// import { User } from 'src/apis/users/entities/user.entity';
// import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

// @Entity()
// @ObjectType()
// export class PointTransaction {
//   @PrimaryGeneratedColumn('uuid')
//   @Field(() => String)
//   id: string;

//   @ManyToOne(() => User)
//   @Field(() => User)
//   user: User;

//   @Column()
//   @Field(() => Boolean)
//   first_slot: boolean;

//   @Column()
//   @Field(() => Boolean)
//   second_slot: boolean;

//   @Column()
//   @Field(() => Boolean)
//   third_slot: boolean;
// }
