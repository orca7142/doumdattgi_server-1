import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UsersService } from './users.service';
import {
  GqlAuthGuard,
  GqlAuthRefreshGuard,
} from '../auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { IContext } from 'src/commons/interfaces/context';
import { UpdateNicknameIntroduceInput } from './dto/update-nicknameIntroduce.input';
import { UpdateUserInfoInput } from './dto/update-userInfo.input';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService, //
  ) {}

  // 이메일 중복 검증 및 이메일 인증번호 전송 API
  @Mutation(() => String)
  sendTokenEmail(
    @Args('email') email: string, //
  ): Promise<string> {
    return this.usersService.sendTokenEmail({ email });
  }

  // 이메일 인증번호 검증 API
  @Mutation(() => Boolean)
  checkValidToken(
    @Args('email') email: string, //
    @Args('token') token: string,
  ): Promise<boolean> {
    return this.usersService.checkValidateToken({ email, token });
  }

  //회원가입 API
  @Mutation(() => User)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.createUser({
      createUserInput,
    });
  }

  // 로그인 유저 정보 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => User)
  fetchLoginUser(
    @Context() context: IContext, //
  ): Promise<User> {
    return this.usersService.findLoginUser({ context });
  }

  // 닉네임 및 자기소개 수정 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => User)
  updateNicknameIntroduce(
    @Args('updateNicknameIntroduceInput')
    updateNicknameIntroduceInput: UpdateNicknameIntroduceInput,
    @Context() context: IContext, //
  ): Promise<User> {
    return this.usersService.updateNicknameIntroduce({
      updateNicknameIntroduceInput,
      context,
    });
  }

  // 유저정보 수정 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => User)
  updateUserInfo(
    @Args('updateUserInfoInput')
    updateUserInfoInput: UpdateUserInfoInput,
    @Context() context: IContext, //
  ): Promise<User> {
    return this.usersService.updateUserInfo({
      updateUserInfoInput,
      context,
    });
  }

  // 유저 회원 탈퇴 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  deleteUser(
    @Context() context: IContext, //
  ): Promise<boolean> {
    return this.usersService.deleteUser({
      context,
    });
  }
}
