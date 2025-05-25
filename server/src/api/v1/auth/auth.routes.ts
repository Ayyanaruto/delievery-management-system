import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "./auth.middleware";

const authRoutes = Router();

authRoutes.post("/login",authController.login)
authRoutes.post("/register", authController.register);
authRoutes.get("/me",authenticate,authController.getCurrentUser)

export default authRoutes
