import { IContext } from 'src/commons/interfaces/context';

export interface IMileagesServiceMileageHistory {
  context: IContext;
}

export interface IMileagesServiceUpdateMileage {
  user_id: string;
  mileage: number;
  couponType: string;
}

export interface IMileagesServicePurchaseCoupon {
  context: IContext;
  coupon: string;
  productId: string;
}
