import PartnerModel from "@/api/v1/partners/partner.model";
import { DELIVERY_PARTNER_STATUS } from "@/constants/constant";
import { BadRequestError, ValidationError } from "@/lib/error";
import OrderModel from "./orders.model";
import { OrderStatus } from "./orders.types";

export class AssignmentService {
  static async assignOrderToPartner(orderId: string, partnerId?: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new ValidationError("Order not found");
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestError("Order is already assigned or completed");
    }

    let partner;

    if (partnerId) {
      partner = await PartnerModel.findById(partnerId);
      if (!partner) {
        throw new ValidationError("Partner not found");
      }
      if (partner.status !== DELIVERY_PARTNER_STATUS.AVAILABLE) {
        throw new BadRequestError("Partner is not available");
      }
    } else {
      partner = await this.findNearestAvailablePartner(order.pickupAddressCord.coordinates);
      if (!partner) {
        throw new ValidationError("No available partners found");
      }
    }

    order.assignedTo = (partner._id as any).toString();
    order.status = OrderStatus.ASSIGNED;
    await order.save();


    partner.assignedOrders.push(order._id as any);
    partner.status = DELIVERY_PARTNER_STATUS.ON_DELIVERY;
    await partner.save();

    return { order, partner };
  }

  static async unassignOrder(orderId: string) {
    const order = await OrderModel.findById(orderId);
    if (!order) {
      throw new ValidationError("Order not found");
    }

    if (!order.assignedTo) {
      throw new BadRequestError("Order is not assigned to any partner");
    }

    const partner = await PartnerModel.findById(order.assignedTo);
    if (partner) {
      partner.assignedOrders = partner.assignedOrders.filter(
        (orderObjectId) => orderObjectId.toString() !== orderId
      );

      if (partner.assignedOrders.length === 0) {
        partner.status = DELIVERY_PARTNER_STATUS.AVAILABLE;
      }
      await partner.save();
    }

    order.assignedTo = null;
    order.status = OrderStatus.PENDING;
    await order.save();

    return { order, partner };
  }

  static async getPartnerOrders(partnerId: string) {
    const partner = await PartnerModel.findById(partnerId).populate('assignedOrders');
    if (!partner) {
      throw new ValidationError("Partner not found");
    }
    return partner.assignedOrders;
  }

  private static async findNearestAvailablePartner(_coordinates: number[]) {

    return await PartnerModel.findOne({
      status: DELIVERY_PARTNER_STATUS.AVAILABLE
    });
  }
}
