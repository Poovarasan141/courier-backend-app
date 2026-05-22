const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    internalOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    clientOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    courierPartner: {
      type: String,
      required: true,
      index: true
    },

    courierOrderId: {
      type: String,
    },

    shipmentId: {
      type: String,
    },

    awbNumber: {
      type: String,
      index: true
    },

    status: {
      type: String,
      enum: [
        'CREATED',
        'PICKED_UP',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'FAILED'
      ],
      default: 'CREATED',
      index: true
    },

    requestPayload: {
      type: Object,
      default: {}
    },

    responsePayload: {
      type: Object,
      default: {}
    },

    failureReason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

orderSchema.index({
  courierPartner: 1,
  status: 1
});

orderSchema.index({
  createdAt: -1
});

module.exports = mongoose.model(
  'Order',
  orderSchema,
  'orders'
);