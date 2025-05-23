import { Request, Response, NextFunction } from "express";

import {
  BadRequestError,
  GenericServerError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/error";
import logger from "@/lib/logger";

import { HttpStatusCode, ROLE } from "@/constants/constant";

import config from "@/config/config";

import {
  RegisterRequestBody,
  LoginRequestBody,
  TokenPayload,
} from "./auth.types";

import AuthService from "./auth.service";
import PartnerService from "../partners/partner.service";

if (!config.jwt.secret) {
  logger.error("JWT_SECRET is not set in environment variables");
  throw new GenericServerError("Missing JWT configuration");
}
export const authController = {
  login: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body as LoginRequestBody;

      if (!email || !password) {
        throw new BadRequestError("Email and password are required");
      }

      const user = await AuthService.findUserByEmail(email);
      if (!user || !(await user.comparePassword(password))) {
        throw new ValidationError("Invalid credentials");
      }

      const tokenPayload: TokenPayload = {
        userId: user.id,
        email: String(user.email),
        role: user.role as ROLE,
        ...(user.partnerId && { metadata: { partnerId: user.partnerId } }),
      };

      const token = AuthService.generateToken(tokenPayload);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  register: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, name, role, password, phone } =
        req.body as RegisterRequestBody;

      if (!email || !name || !role || !password) {
        throw new BadRequestError(
          "Email, name, role, and password are required"
        );
      }

      const existingUser = await AuthService.findUserByEmail(email);
      if (existingUser) {
        throw new ValidationError("User already exists");
      }

      let partnerId: string | undefined;

      if (role === ROLE.PARTNER) {
        if (!phone) {
          throw new BadRequestError("Phone number is required for partners");
        }
        partnerId = await PartnerService.createPartner(name, email, phone);
      }

      const newUser = await AuthService.createUser({
        name,
        email,
        password,
        role,
        partnerId,
      });

      const tokenPayload: TokenPayload = {
        userId: newUser.id,
        email: String(newUser.email),
        role: newUser.role as ROLE,
        ...(partnerId && { metadata: { partnerId } }),
      };

      const token = AuthService.generateToken(tokenPayload);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          name,
          email,
          role,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getCurrentUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // @ts-ignore - req.user is added by auth middleware
      const userEmail = req.user?.email;
      if (!userEmail) {
        throw new UnauthorizedError("Unauthorized");
      }

      const user = await AuthService.findUserByEmail(userEmail);
      if (!user) {
        throw new NotFoundError("User not found");
      }

      let additionalData = {};
      if (user.role === ROLE.PARTNER && user.partnerId) {
        const partner = await PartnerService.findPartnerById(user.partnerId);
        if (partner) {
          additionalData = {
            name: partner.name,
            phone: partner.phone,
            status: partner.status,
          };
        }
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          ...additionalData,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
