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
