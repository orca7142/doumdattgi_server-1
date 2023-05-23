import { IContext } from 'src/commons/interfaces/context';
import { CreateRequestInput } from '../dto/create-request.input';

export interface ICreateRequestInput {
  createRequestInput: CreateRequestInput;
  context: IContext;
}

export interface IFetchRequestInput {
  context: IContext;
}

export interface IFetchWorkInput {
  context: IContext;
}

export interface IRequestStartInput {
  process: string;
  request_id: string;
  context: IContext;
}

export interface IRequestAcceptRefuseInput {
  acceptRefuse: string;
  request_id: string;
}

export interface IFetchOneRequestInput {
  request_id: string;
}
