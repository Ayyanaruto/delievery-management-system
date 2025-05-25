import { Router } from "express";
import { partnerController } from "./partner.controller";

const partnerRoutes = Router();

partnerRoutes.get("/", partnerController.getAllPartners);
partnerRoutes.get("/:id", partnerController.getPartnerById);
partnerRoutes.post("/", partnerController.createPartner);
partnerRoutes.put("/:id", partnerController.updatePartner);
partnerRoutes.patch("/:id/status", partnerController.updatePartnerStatus);
partnerRoutes.delete("/:id", partnerController.deletePartner);

export default partnerRoutes;
