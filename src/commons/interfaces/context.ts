import { Request, Response } from 'express';

export interface IAuthUser {
  user?: {
    user_id?: string;
    user_email?: string;
  };
}

export interface IContext {
  req: Request & IAuthUser;
  res: Response;
}
