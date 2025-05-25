import { Router } from 'express';
import { orderController } from './order.controller';

const orderRoutes = Router();

orderRoutes.post("/",orderController.createOrder)
orderRoutes.get("/",orderController.getAllOrders)
orderRoutes.get("/partner/:partnerId", orderController.getPartnerOrders);
orderRoutes.get("/:orderId",orderController.getOrder)
orderRoutes.put("/:orderId", orderController.updateOrder);
orderRoutes.delete("/:orderId", orderController.deleteOrder);
orderRoutes.post("/:orderId/assign", orderController.assignOrder);
orderRoutes.post("/:orderId/unassign", orderController.unassignOrder);

export default orderRoutes
