import Partner from "../partners/partner.model";
import { DELIVERY_PARTNER_STATUS } from "@/constants/constant";
import { IPartner } from "./partner.types";
import { Schema } from "mongoose";

class PartnerService {
  static async createPartner(
    name: string,
    email: string,
    phone: string
  ): Promise<string> {
    const newPartner = new Partner({
      name,
      email,
      phone,
      status: DELIVERY_PARTNER_STATUS.AVAILABLE,
    });

    await newPartner.save();
    return newPartner.id;
  }
  static async findPartnerById(id: Schema.Types.ObjectId): Promise<IPartner | null> {
    const existingPartner = await Partner.findById(id);
    return existingPartner;
  }
}

export default PartnerService;
