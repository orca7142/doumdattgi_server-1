import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { UsersService } from './users.service';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { UseGuards } from '@nestjs/common';
import { IContext } from 'src/commons/interfaces/context';
import { UpdateNicknameIntroduceInput } from './dto/update-nicknameIntroduce.input';
import { UpdateUserInfoInput } from './dto/update-userInfo.input';
import { Slot } from '../slot/entites/slot.entity';

@Resolver()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService, //
  ) {}

  // 이메일 인증번호 전송 API
  @Mutation(() => String)
  sendTokenEmail(
    @Args('user_email') user_email: string, //
  ): Promise<string> {
    return this.usersService.sendTokenEmail({ user_email });
  }

  // 이메일 인증번호 검증 API
  @Mutation(() => Boolean)
  checkValidTokenEMAIL(
    @Args('user_email') user_email: string,
    @Args('user_token') user_token: string,
  ): Promise<boolean> {
    return this.usersService.checkValidateTokenEMAIL({
      user_email,
      user_token,
    });
  }

  // 문자 인증번호 전송 API
  @Mutation(() => String)
  sendTokenSMS(
    @Args('user_phone') user_phone: string, //
  ): Promise<string> {
    return this.usersService.sendTokenSMS({ user_phone });
  }

  // 이메일 찾기 API
  @Mutation(() => String)
  checkValidTokenFindEmailBySMS(
    @Args('user_phone') user_phone: string,
    @Args('user_token') user_token: string,
  ): Promise<string> {
    return this.usersService.checkValidTokenFindEmailBySMS({
      user_phone,
      user_token,
    });
  }

  // 비밀번호 찾기 API
  @Mutation(() => Boolean)
  checkValidTokenFindPwdBySMS(
    @Args('user_phone') user_phone: string,
    @Args('user_token') user_token: string,
  ): Promise<boolean> {
    return this.usersService.checkValidTokenFindPwdBySMS({
      user_phone,
      user_token,
    });
  }

  // 비밀번호 재설정 API
  @Mutation(() => Boolean)
  resetPassword(
    @Args('user_phone') user_phone: string,
    @Args('new_password') new_password: string,
  ): Promise<boolean> {
    return this.usersService.resetPassword({
      user_phone,
      new_password,
    });
  }

  // 설정 페이지 비밀번호 재설정 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  resetPasswordSettingPage(
    @Args('password') password: string,
    @Args('new_password') new_password: string,
    @Context() context: IContext,
  ): Promise<boolean> {
    return this.usersService.resetPasswordSettingPage({
      password,
      new_password,
      context,
    });
  }

  // 회원가입 API
  @Mutation(() => User)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<User> {
    return this.usersService.createUser({
      createUserInput,
    });
  }

  // 로그인한 유저 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => User)
  fetchLoginUser(
    @Context() context: IContext, //
  ): Promise<User> {
    return this.usersService.findLoginUser({ context });
  }

  // 설정 페이지 닉네임 또는 자기소개 수정 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => User)
  updateNicknameIntroduce(
    @Args('updateNicknameIntroduceInput')
    updateNicknameIntroduceInput: UpdateNicknameIntroduceInput,
    @Context() context: IContext,
  ): Promise<User> {
    return this.usersService.updateNicknameIntroduce({
      updateNicknameIntroduceInput,
      context,
    });
  }

  // 설정 페이지 프로필 사진 수정 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => User)
  updateProfileImage(
    @Args('user_url') user_url: string,
    @Context() context: IContext,
  ): Promise<User> {
    return this.usersService.updateProfileImage({
      user_url,
      context,
    });
  }

  // 설정 페이지 유저 정보 수정 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => User)
  updateUserInfo(
    @Args('updateUserInfoInput')
    updateUserInfoInput: UpdateUserInfoInput,
    @Context() context: IContext,
  ): Promise<User> {
    return this.usersService.updateUserInfo({
      updateUserInfoInput,
      context,
    });
  }

  // 회원 탈퇴 API
  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => Boolean)
  deleteUser(
    @Context() context: IContext, //
  ): Promise<boolean> {
    return this.usersService.deleteUser({
      context,
    });
  }

  // 유저 슬롯 조회 API
  @UseGuards(GqlAuthGuard('access'))
  @Query(() => Slot)
  fetchUserSlot(
    @Context() context: IContext, //
  ): Promise<Slot> {
    return this.usersService.findUserSlot({ context });
  }
}
