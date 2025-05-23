import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "./auth.middleware";

const router = Router();

router.post("/login",authController.login)
router.post("/register", authController.register);
router.get("/me",authenticate,authController.getCurrentUser)

export const authRoutes = router;
