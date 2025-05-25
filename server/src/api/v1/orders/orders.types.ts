import { Document } from "mongoose";

export enum OrderStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_TRANSIT = 'in-transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface IOrder extends Document {
  customer: string;
  customerPhone: string;
  deliveryAddress: string;
  pickupAddress: string;
  pickupAddressCord: {
    type: 'Point';
    coordinates: [number, number];
  };
  deliveryAddressCord: {
    type: 'Point';
    coordinates: [number, number];
  };
  items: string[];
  status: OrderStatus;
  assignedTo?: string|null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrder {
  customer: string;
  customerPhone: string;
  deliveryAddress: string;
  pickupAddress: string;
  pickupAddressCord: {
    type: 'Point';
    coordinates: [number, number];
  };
  deliveryAddressCord: {
    type: 'Point';
    coordinates: [number, number];
  };
  items: string[];
}
