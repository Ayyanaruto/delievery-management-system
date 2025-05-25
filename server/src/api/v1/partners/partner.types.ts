import { DELIVERY_PARTNER_STATUS } from "@/constants/constant";
import { Document, Schema } from "mongoose";

export interface IPartner extends Document {
  name: string;
  email: string;
  phone: string;
  status: DELIVERY_PARTNER_STATUS;
  assignedOrders: Schema.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}
export interface CreatePartnerRequestBody {
  name: string;
  email: string;
  phone: string;
}

export interface UpdatePartnerStatusRequestBody {
  status: DELIVERY_PARTNER_STATUS;
}

export interface UpdatePartnerRequestBody {
  name: string;
  email: string;
  phone: string;
}
