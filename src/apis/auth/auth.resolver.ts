import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { IContext } from 'src/commons/interfaces/context';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard, GqlAuthRefreshGuard } from './guards/gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  // 로그인 API
  @Mutation(() => String)
  login(
    @Args('email') email: string, //
    @Args('password') password: string,
    @Context() context: IContext,
  ): Promise<string> {
    return this.authService.login({
      email, //
      password,
      context,
    });
  }

  // 로그아웃 API
  @Mutation(() => String)
  async logout(
    @Context() context: IContext, //
  ) {
    const headers = context.req.headers;
    await this.authService.logout({ headers });
    return '로그아웃에 성공했습니다';
  }

  // accessToken 재발급 API
  @UseGuards(GqlAuthGuard('refresh'))
  @Mutation(() => String)
  restoreAccessToken(
    @Context() context: IContext, //
  ): string {
    return this.authService.restoreAccessToken({ user: context.req.user });
  }
}
