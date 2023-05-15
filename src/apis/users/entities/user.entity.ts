import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
@ObjectType()
export class User {
  // 유저ID
  @PrimaryGeneratedColumn('uuid')
  @Field(() => String)
  id: string;

  // 이메일 주소
  @Column()
  @Field(() => String)
  email: string;

  // 비밀번호
  @Column()
  @Field(() => String)
  password: string;

  // 이름
  @Column()
  @Field(() => String)
  name: string;

  // 닉네임
  @Column()
  @Field(() => String)
  nickname: string;

  // 휴대전화 번호
  @Column()
  @Field(() => String)
  phone: string;

  // 프로필 이미지
  @Column({ default: '' })
  @Field(() => String)
  profileImage: string;

  // 자기소개
  @Column({ default: '' })
  @Field(() => String)
  introduce: string;

  // 포트폴리오 주소
  @Column({ default: '' })
  @Field(() => String)
  portfolio: string;

  // 작업통계
  @Column({ default: 0 })
  @Field(() => Int)
  workRate: number;

  // 포인트
  @Column({ default: 0 })
  @Field(() => Int)
  point: number;

  // 회원탈퇴 시간
  @DeleteDateColumn()
  deletedAt: Date;
}
