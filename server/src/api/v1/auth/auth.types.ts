import { ROLE } from "@/constants/constant";
import { Schema } from "mongoose";

export interface IUser {
  name: String;
  email: String;
  password: String;
  role: String;
  partnerId: Schema.Types.ObjectId;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterRequestBody {
  email: string;
  name: string;
  role: string;
  password: string;
  phone?: string;
}

export interface LoginRequestBody{
  email:string,
  password:string
}

export interface TokenPayload{
  userId:string,
  email:string,
  role:ROLE
  metadata?:{
    partnerId:Schema.Types.ObjectId | string
  }
}

