import { HttpStatusCode } from "@/constants/constant";
import {
  BadRequestError,
  ValidationError
} from "@/lib/error";
import { NextFunction, Request, Response } from "express";
import { AssignmentService } from "./assignment.service";
import OrderService from "./orders.service";
import { CreateOrder } from "./orders.types";

export const orderController = {
  createOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const orderData = req.body as CreateOrder;

      // Validate required fields
      if (!orderData.customer || !orderData.customerPhone || !orderData.pickupAddress ||
          !orderData.deliveryAddress || !orderData.items || !orderData.pickupAddressCord ||
          !orderData.deliveryAddressCord) {
        throw new BadRequestError("All required fields must be provided");
      }

      // Validate coordinate structure
      if (!orderData.pickupAddressCord.coordinates || !orderData.deliveryAddressCord.coordinates ||
          orderData.pickupAddressCord.coordinates.length !== 2 ||
          orderData.deliveryAddressCord.coordinates.length !== 2) {
        throw new BadRequestError("Valid coordinates are required for pickup and delivery addresses");
      }

      const newOrder = await OrderService.createOrders(orderData);

      if (!newOrder) {
        throw new ValidationError("Failed to create order");
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          id: newOrder._id,
          message: "Order created successfully",
          order: newOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getAllOrders: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { status } = req.query;
      const statusFilter = status ? String(status) : undefined;

      const orders = await OrderService.getAllOrders(statusFilter);

      if (!orders) {
        throw new ValidationError("Failed to fetch orders");
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },
  getOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;
      if (!orderId) {
        throw new BadRequestError("Please provide Order Id");
      }
      const order = await OrderService.findOrdersById(orderId);
      if (!order) {
        throw new ValidationError("Order does not exist");
      }
      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: order
      });
    } catch (error) {
      next(error);
    }
  },

  assignOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;
      const { partnerId } = req.body;

      if (!orderId) {
        throw new BadRequestError("Order ID is required");
      }

      const result = await AssignmentService.assignOrderToPartner(orderId, partnerId);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          message: "Order assigned successfully",
          order: result.order,
          partner: result.partner,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  unassignOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        throw new BadRequestError("Order ID is required");
      }

      const result = await AssignmentService.unassignOrder(orderId);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          message: "Order unassigned successfully",
          order: result.order,
          partner: result.partner,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  getPartnerOrders: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { partnerId } = req.params;

      if (!partnerId) {
        throw new BadRequestError("Partner ID is required");
      }

      const orders = await AssignmentService.getPartnerOrders(partnerId);

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: orders,
      });
    } catch (error) {
      next(error);
    }
  },

  updateOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;
      const updateData = req.body as Partial<CreateOrder>;

      if (!orderId) {
        throw new BadRequestError("Order ID is required");
      }

      // Validate coordinates if they're being updated
      if (updateData.pickupAddressCord && (!updateData.pickupAddressCord.coordinates ||
          updateData.pickupAddressCord.coordinates.length !== 2)) {
        throw new BadRequestError("Valid pickup coordinates are required");
      }

      if (updateData.deliveryAddressCord && (!updateData.deliveryAddressCord.coordinates ||
          updateData.deliveryAddressCord.coordinates.length !== 2)) {
        throw new BadRequestError("Valid delivery coordinates are required");
      }

      const updatedOrder = await OrderService.updateOrder(orderId, updateData);

      if (!updatedOrder) {
        throw new ValidationError("Order not found or failed to update");
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          message: "Order updated successfully",
          order: updatedOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  deleteOrder: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        throw new BadRequestError("Order ID is required");
      }

      const deletedOrder = await OrderService.deleteOrder(orderId);

      if (!deletedOrder) {
        throw new ValidationError("Order not found");
      }

      res.status(HttpStatusCode.SUCCESS).json({
        success: true,
        data: {
          message: "Order deleted successfully",
          order: deletedOrder,
        },
      });
    } catch (error) {
      next(error);
    }
  },
}
