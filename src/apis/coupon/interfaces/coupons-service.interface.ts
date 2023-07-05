import { IContext } from 'src/commons/interfaces/context';

export interface ICouponsServicePurchaseCoupon {
  context: IContext;
  coupon: string;
  productId: string;
}

export interface ICouponsServiceCheckMileage {
  user_id: string;
}

export interface ICouponsServiceUpdateMileage {
  user_id: string;
  mileage: number;
}

export interface ICouponsServiceUseCoupon {
  context: IContext;
}
