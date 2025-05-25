import { DELIVERY_PARTNER_STATUS } from "@/constants/constant";
import { Schema } from "mongoose";
import Partner from "../partners/partner.model";
import { IPartner } from "./partner.types";

class PartnerService {
  static async getAllPartners(status:string|null):Promise<IPartner[]>{
    let partners;
    if(!status){
      partners = await Partner.find({})
    }else{
      partners = await Partner.find({status})
    }
    return partners
  }
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
  static async findPartnerById(id: Schema.Types.ObjectId | string): Promise<IPartner | null> {
    const existingPartner = await Partner.findById(id.toString());
    return existingPartner;
  }
static async updatePartner(id:Schema.Types.ObjectId|string,body:{name?:string,email?:string,phone?:string}): Promise<IPartner | null>{
  const updatedPartner = await Partner.findByIdAndUpdate(id.toString(),{...body}, {new: true})
  return updatedPartner
}
static async updateStatus(id:Schema.Types.ObjectId|string , status:DELIVERY_PARTNER_STATUS):Promise<IPartner|null>{
    const updatedPartner = await Partner.findByIdAndUpdate(id.toString(), {status}, {new: true})
    return updatedPartner;
  }
  static async deleteStatus(id:Schema.Types.ObjectId|string){
    const deletedPartner = await Partner.findByIdAndDelete(id.toString())
    return deletedPartner
  }
}

export default PartnerService;
