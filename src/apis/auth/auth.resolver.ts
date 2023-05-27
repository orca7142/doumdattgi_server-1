import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { IContext } from 'src/commons/interfaces/context';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => String)
  login(
    @Args('user_email') user_email: string,
    @Args('user_password') user_password: string,
    @Context() context: IContext,
  ): Promise<string> {
    return this.authService.login({
      user_email,
      user_password,
      context,
    });
  }

  @UseGuards(GqlAuthGuard('access'))
  @Mutation(() => String)
  async logout(
    @Context() context: IContext, //
  ): Promise<string> {
    await this.authService.logout({ req: context.req });
    return '로그아웃에 성공했습니다';
  }

  @UseGuards(GqlAuthGuard('refresh'))
  @Mutation(() => String)
  restoreAccessToken(
    @Context() context: IContext, //
  ): string {
    return this.authService.restoreAccessToken({ user: context.req.user });
  }
}
