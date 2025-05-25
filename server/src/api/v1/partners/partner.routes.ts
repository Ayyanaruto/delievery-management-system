import { Router } from "express";
import { authenticate, authorizeAdmin } from "../auth/auth.middleware";
import { partnerController } from "./partner.controller";

const partnerRoutes = Router();


partnerRoutes.get("/", authenticate, authorizeAdmin, partnerController.getAllPartners);
partnerRoutes.get("/:id", authenticate, partnerController.getPartnerById);
partnerRoutes.post("/", authenticate, authorizeAdmin, partnerController.createPartner);
partnerRoutes.put("/:id", authenticate, partnerController.updatePartner);
partnerRoutes.patch("/:id/status", authenticate, partnerController.updatePartnerStatus);
partnerRoutes.delete("/:id", authenticate, authorizeAdmin, partnerController.deletePartner);

export default partnerRoutes;
