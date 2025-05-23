import jwt from "jsonwebtoken";
import User from "./auth.model";
import { TokenPayload } from "./auth.types";
import config from "@/config/config";
import { GenericServerError } from "@/lib/error";

class AuthService {
  static async findUserByEmail(email: string) {
    return User.findOne({ email });
  }

  static generateToken(payload: TokenPayload): string {
    if (!config.jwt.secret) {
      throw new GenericServerError("Missing JWT configuration");
    }
    return jwt.sign(payload, config.jwt.secret as string);
  }

  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    partnerId?: string | undefined;
  }) {
    const newUser = new User(userData);
    await newUser.save();
    return newUser;
  }
}

export default AuthService;
