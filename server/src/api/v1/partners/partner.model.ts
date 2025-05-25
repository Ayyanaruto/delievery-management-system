import {
  DELIVERY_PARTNER_STATUS,
  VALIDATION_ERROR_MESSAGE,
} from "@/constants/constant";
import { validateEmail } from "@/lib/validateEmail";
import { Schema, model } from "mongoose";
import { IPartner } from "./partner.types";

const partnerSchema = new Schema<IPartner>(
  {
    name: {
      type: String,
      required: [true, VALIDATION_ERROR_MESSAGE.REQUIRED_EMAIL],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, VALIDATION_ERROR_MESSAGE.REQUIRED_EMAIL],
      validate: [validateEmail, VALIDATION_ERROR_MESSAGE.INVALID_EMAIL],
      index: true,
    },
    phone: {
      type: String,
      required: [true, VALIDATION_ERROR_MESSAGE.REQUIRED_PHONE],
      minlength: [10, VALIDATION_ERROR_MESSAGE.INVALID_PHONE],
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(DELIVERY_PARTNER_STATUS),
      default: DELIVERY_PARTNER_STATUS.AVAILABLE,
      required: true,
    },
    assignedOrders: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

  },
  {
    timestamps: true,
  }
);

partnerSchema.index({ status: 1, createdAt: -1 });
partnerSchema.index({ phone: 1, status: 1 });

export default model<IPartner>("Partner", partnerSchema);
