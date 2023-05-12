import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class UsersResolver {
  @Query(() => String)
  fetchUsers(): string {
    return '모든 유저 조회하기';
  }
}
