import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { CommentResolver } from './comment.resolver';
import { CommentsService } from './comment.service';
import { Request } from '../request/entites/request.entity';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Request, //
      Comment,
    ]),
  ],
  providers: [
    CommentResolver, //
    CommentsService,
  ],
})
export class CommentsModule {}
