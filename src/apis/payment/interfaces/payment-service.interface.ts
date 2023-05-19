import { IAuthUser } from 'src/commons/interfaces/context';
import { PAYMENT_STATUS_ENUM, Payment } from '../entities/payment.entity';

export interface IPaymentsServiceCreateFindOneByImUid {
  payment_impUid: string;
}

export interface IPaymentsServiceCheckDuplication {
  payment_impUid: string;
}

export interface IPaymentsServiceCreate {
  payment_impUid: string;
  payment_amount: number;
  user: IAuthUser['user'];
  payment_status?: PAYMENT_STATUS_ENUM;
  payment_type: string;
}

export interface IPaymentsServiceCreateForPayment {
  payment_impUid: string;
  payment_amount: number;
  user: IAuthUser['user'];
  payment_type: string;
}

export interface IPaymentsServiceFindByImpUidAndUser {
  payment_impUid: string;
  user: IAuthUser['user'];
}

export interface IPaymentsServiceCheckAlreadyCanceled {
  payments: Payment[];
}

export interface IPaymentsServiceCheckHasCancelablePoint {
  payments: Payment[];
}

export interface IPaymentsServiceCancel {
  payment_impUid: string;
  payment_type: string;
  user: IAuthUser['user'];
}
