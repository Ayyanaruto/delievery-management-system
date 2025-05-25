import config from "@/config/config";
import { ROLE } from "@/constants/constant";
import { ForbiddenError, UnauthorizedError } from "@/lib/error";
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedError("Authorization header is required");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new UnauthorizedError(
        "Invalid token format. Bearer token required"
      );
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (req.user.role !== ROLE.ADMIN) {
      throw new ForbiddenError("Admin access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizePartner = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (req.user.role !== ROLE.PARTNER) {
      throw new ForbiddenError("Partner access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeAdminOrPartner = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    if (req.user.role !== ROLE.ADMIN && req.user.role !== ROLE.PARTNER) {
      throw new ForbiddenError("Admin or Partner access required");
    }

    next();
  } catch (error) {
    next(error);
  }
};
