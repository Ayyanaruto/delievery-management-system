import { Schema } from "mongoose";

export interface IPartner {
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedOrders: Schema.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}