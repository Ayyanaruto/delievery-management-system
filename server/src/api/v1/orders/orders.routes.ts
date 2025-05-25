import { Router } from 'express';
import { authenticate, authorizeAdmin, authorizeAdminOrPartner } from '../auth/auth.middleware';
import { orderController } from './order.controller';

const orderRoutes = Router();

// Admin only routes
orderRoutes.post("/", authenticate, authorizeAdmin, orderController.createOrder);
orderRoutes.get("/", authenticate, authorizeAdmin, orderController.getAllOrders);
orderRoutes.post("/:orderId/assign", authenticate, authorizeAdmin, orderController.assignOrder);
orderRoutes.post("/:orderId/unassign", authenticate, authorizeAdmin, orderController.unassignOrder);
orderRoutes.put("/:orderId", authenticate, authorizeAdmin, orderController.updateOrder);
orderRoutes.delete("/:orderId", authenticate, authorizeAdmin, orderController.deleteOrder);

// Admin and Partner routes
orderRoutes.get("/partner/:partnerId", authenticate, authorizeAdminOrPartner, orderController.getPartnerOrders);
orderRoutes.get("/:orderId", authenticate, authorizeAdminOrPartner, orderController.getOrder);
orderRoutes.patch("/:orderId/status", authenticate, authorizeAdminOrPartner, orderController.updateOrderStatus);

export default orderRoutes;
