import { IContext } from 'src/commons/interfaces/context';

export interface ICouponsServicePurchaseCoupon {
  context: IContext;
  coupon: string;
}

export interface ICouponsServiceCheckMileage {
  user_id: string;
}
