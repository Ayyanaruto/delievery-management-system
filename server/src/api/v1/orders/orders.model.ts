import { VALIDATION_ERROR_MESSAGE } from '@/constants/constant';
import mongoose, { Schema } from 'mongoose';
import { IOrder, OrderStatus } from './orders.types';

const OrderSchema: Schema = new Schema({
  customer: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    required: true,
    trim: true
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true
  },
  pickupAddress: {
    type: String,
    required: true,
    trim: true
  },
  pickupAddressCord: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v && v.length === 2 &&
                 v[0] != null && v[0] >= -180 && v[0] <= 180 &&
                 v[1] != null && v[1] >= -90 && v[1] <= 90;
        },
        message: VALIDATION_ERROR_MESSAGE.INVALID_COORDINATES
      }
    }
  },
  deliveryAddressCord: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: function(v: number[]) {
          return v && v.length === 2 &&
                 v[0] != null && v[0] >= -180 && v[0] <= 180 &&
                 v[1] != null && v[1] >= -90 && v[1] <= 90;
        },
        message: VALIDATION_ERROR_MESSAGE.INVALID_COORDINATES
      }
    }
  },
  items: [{
    type: String,
    required: true,
    trim: true
  }],
  status: {
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.PENDING
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "Partner",
    default: null
  }
}, {
  timestamps: true,
  versionKey: false,
  collection: 'orders'
});


OrderSchema.index({ pickupAddressCord: '2dsphere' });
OrderSchema.index({ deliveryAddressCord: '2dsphere' });

OrderSchema.index({ status: 1 });
OrderSchema.index({ assignedTo: 1 });
OrderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
