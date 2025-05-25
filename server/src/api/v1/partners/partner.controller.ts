import { DELIVERY_PARTNER_STATUS, HttpStatusCode } from "@/constants/constant";
import {
  BadRequestError,
  NotFoundError,
  ValidationError,
} from "@/lib/error";
import { NextFunction, Request, Response } from "express";
import PartnerService from "./partner.service";
import { CreatePartnerRequestBody, UpdatePartnerRequestBody, UpdatePartnerStatusRequestBody } from "./partner.types";



export const partnerController = {
  getAllPartners: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const statusFilter = status ? String(status) : null;

      if (statusFilter && !Object.values(DELIVERY_PARTNER_STATUS).includes(statusFilter as DELIVERY_PARTNER_STATUS)) {
        throw new BadRequestError("Invalid status value");
      }

      const partners = await PartnerService.getAllPartners(statusFilter);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: partners,
      });
    } catch (error) {
      next(error);
    }
  },

  getPartnerById: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Partner ID is required");
      }
      const partner = await PartnerService.findPartnerById(id);
      if (!partner) {
        throw new NotFoundError("Partner not found");
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: partner,
      });
    } catch (error) {
      next(error);
    }
  },

  createPartner: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { name, email, phone } = req.body as CreatePartnerRequestBody;

      if (!name || !email || !phone) {
        throw new BadRequestError("Name, email, and phone are required");
      }
      const partnerId = await PartnerService.createPartner(name, email, phone);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          id: partnerId,
          message: "Partner created successfully",
        },
      });
    } catch (error) {
      next(error);
    }
  },

  updatePartnerStatus: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { status } = req.body as UpdatePartnerStatusRequestBody;

      if (!id) {
        throw new BadRequestError("Partner ID is required");
      }

      if (!status) {
        throw new BadRequestError("Status is required");
      }

      if (!Object.values(DELIVERY_PARTNER_STATUS).includes(status)) {
        throw new ValidationError("Invalid status value");
      }
      const updatedPartner = await PartnerService.updateStatus(id, status);
      if (!updatedPartner) {
        throw new NotFoundError("Partner not found");
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: updatedPartner,
      });
    } catch (error) {
      next(error);
    }
  },

  updatePartner: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, email, phone } = req.body as UpdatePartnerRequestBody;

      if (!id) {
        throw new BadRequestError("Partner ID is required");
      }

      if (!name && !email && !phone) {
        throw new BadRequestError("At least one field (name, email, or phone) is required");
      }

      const updateData: Partial<UpdatePartnerRequestBody> = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;

      const updatedPartner = await PartnerService.updatePartner(id, updateData as UpdatePartnerRequestBody);

      if (!updatedPartner) {
        throw new NotFoundError("Partner not found");
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          message: "Partner updated successfully",
          partner: updatedPartner,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  deletePartner: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Partner ID is required");
      }
      const deletedPartner = await PartnerService.deleteStatus(id);;
      if (!deletedPartner) {
        throw new NotFoundError("Partner not found");
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          message: "Partner deleted successfully",
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
