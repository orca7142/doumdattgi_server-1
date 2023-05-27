import { CreateCommentInput } from '../dto/create-comment.input';

export interface ICommentServiceCreate {
  createCommentInput: CreateCommentInput;
}

export interface ICommentServiceSaveComment {
  request_id: string;
  text: string;
  sender_id: string;
}

export interface ICommentServiceFindSellerBuyer {
  request_id: string;
}

export interface ICommentServiceFindComments {
  request_id: string;
}
