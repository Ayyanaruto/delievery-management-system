import { Schema } from "mongoose";
import Orders from "./orders.model";
import { CreateOrder, IOrder } from "./orders.types";

class OrderService{
  static async createOrders(order:CreateOrder):Promise<IOrder|null>{
    const newOrder = new Orders({
      ...order
    })
    await newOrder.save()
    return newOrder
  }
  static async getAllOrders(status?:string):Promise<IOrder[]|null>{
    let allOrders ;
    if(status){
      allOrders = await Orders.find({status})
    }else{
      allOrders = await Orders.find({})
    }
    return allOrders
  }

  static async findOrdersById(id: Schema.Types.ObjectId | string): Promise<IOrder | null> {
    const singleOrder = await Orders.findById(id).populate('assignedTo', 'name email phone vehicleType status');
    return singleOrder;
  }

  static async updateOrder(id: Schema.Types.ObjectId | string, updateData: Partial<CreateOrder>): Promise<IOrder | null> {
    const updatedOrder = await Orders.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email phone vehicleType status');
    return updatedOrder;
  }

  static async deleteOrder(id: Schema.Types.ObjectId | string): Promise<IOrder | null> {
    const deletedOrder = await Orders.findByIdAndDelete(id);
    return deletedOrder;
  }
}

export default OrderService;
