import { Schema, model } from "mongoose";
import {
  DELIVERY_PARTNER_STATUS,
  VALIDATION_ERROR_MESSAGE,
} from "@/constants/constant";
import { validateEmail } from "@/lib/validateEmail";
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
    },
    status: {
      type: String,
      enum: [
        DELIVERY_PARTNER_STATUS.ASSIGNED,
        DELIVERY_PARTNER_STATUS.AVAILABLE,
        DELIVERY_PARTNER_STATUS.OFFLINE,
        DELIVERY_PARTNER_STATUS.ON_BREAK,
        DELIVERY_PARTNER_STATUS.ON_DELIVERY,
      ],
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

export default model<IPartner>("Partner", partnerSchema);
