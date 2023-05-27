import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ICommentServiceCreate,
  ICommentServiceFindComments,
  ICommentServiceFindSellerBuyer,
  ICommentServiceSaveComment,
} from './interfaces/comment-service.interface';
import { Request } from '../request/entites/request.entity';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async saveComment({
    request_id,
    text,
    sender_id,
  }: ICommentServiceSaveComment): Promise<Comment> {
    return await this.commentsRepository.save({
      request: { request_id },
      comment_text: text,
      sender_id,
      user: { user_id: sender_id },
    });
  }
  async findSellerBuyer({
    request_id,
  }: ICommentServiceFindSellerBuyer): Promise<Request> {
    return await this.requestsRepository.findOne({
      where: { request_id },
    });
  }

  async createComment({
    createCommentInput,
  }: ICommentServiceCreate): Promise<Comment> {
    const { request_id, sender_id, text } = createCommentInput;

    return await this.saveComment({ request_id, text, sender_id });
  }

  async findComments({
    request_id,
  }: ICommentServiceFindComments): Promise<Comment[]> {
    return await this.commentsRepository.find({
      where: { request: { request_id } },
      relations: ['user', 'request'],
      order: { comment_createdAt: 'DESC' },
    });
  }
}
