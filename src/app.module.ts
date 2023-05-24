import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './apis/users/users.module';
import { MailerModule } from '@nestjs-modules/mailer';
import * as redisStore from 'cache-manager-redis-store';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { AuthModule } from './apis/auth/auth.module';
import { FilesModule } from './apis/files/files.module';
import { ProductModule } from './apis/product/product.module';
import { RequestsModule } from './apis/request/request.module';
import { PaymentsModule } from './apis/payment/payment.module';
import { PickModule } from './apis/pick/pick.module';
import { CommentsModule } from './apis/comment/comment.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    FilesModule,
    ProductModule,
    RequestsModule,
    PaymentsModule,
    CommentsModule,
    PickModule,
    ConfigModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'src/commons/graphql/schema.gql',
      context: ({ req, res }) => ({ req, res }),
    }),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          service: 'gmail',
          host: process.env.EMAIL_HOST,
          port: Number(process.env.DATABASE_PORT),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          template: {
            dir: __dirname + '/templates/',
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        },
      }),
    }),
    TypeOrmModule.forRoot({
      type:
        process.env.DATABASE_TYPE === 'mysql'
          ? process.env.DATABASE_TYPE
          : 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DATABASE,
      entities: [__dirname + '/apis/**/*.entity.*'],
      synchronize: true,
      logging: true,
    }),
    CacheModule.register({
      store: redisStore,
      url: 'redis://doumdattgi-redis:6379',
      isGlobal: true,
    }),
  ],
})
export class AppModule {}
