const { v4: uuidv4 } = require("uuid");

const Order = require("../models/Order");

const TrackingHistory = require("../models/TrackingHistory");

const { getCourierPartner } = require("../couriers");

const errorHandler = require("../utils/errorHandler");

const logger = require("../utils/logger");

const createOrder = async (req, res) => {
  const payload = req.body;

  try {
    const { courier_partner, order_id } = payload;

    /*
        Idempotency check
      */

    // const existingOrder =
    //   await Order.findOne({
    //     clientOrderId:
    //       order_id
    //   });

    // if (existingOrder) {
    //   return res.status(200).json({
    //     success: true,
    //     message:
    //       'Order already exists',
    //     data:
    //       existingOrder
    //   });
    // }

    /*
        Get courier partner
      */

    const CourierPartner = getCourierPartner(courier_partner);

    /*
        Create shipment
      */

    const courierResponse = await CourierPartner.createOrder(payload);

    /*
        Save order
      */

    const order = await Order.create({
      internalOrderId: `TF_${uuidv4()}`,

      clientOrderId: order_id,

      courierPartner: courier_partner,

      courierOrderId: courierResponse.courier_order_id,

      shipmentId: courierResponse.shipment_id,

      awbNumber: courierResponse.awb_number,

      status: courierResponse.status,

      requestPayload: payload,

      responsePayload: courierResponse,
    });

    /*
        Save tracking history
      */

    await TrackingHistory.create({
      internalOrderId: order.internalOrderId,

      courierPartner: courier_partner,

      status: courierResponse.status,

      rawPayload: courierResponse,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",

      data: order,
    });
  } catch (error) {
    logger({
      orderId: payload?.order_id,

      courierPartner: payload?.courier_partner,

      requestId: req.headers["x-request-id"] || null,

      errorType: error.code || "CREATE_ORDER_FAILED",

      error,
    });

    /*
        Persist failure
      */

    await Order.create({
      internalOrderId: `FAILED_${uuidv4()}`,

      clientOrderId: payload?.order_id,

      courierPartner: payload?.courier_partner,

      status: "FAILED",

      requestPayload: payload,

      responsePayload: {
        error: error.message,
      },
    });

    return errorHandler(res, error);
  }
};

const trackOrder = async (req, res) => {
  try {
    const { courier_partner } = req.query;

    const { orderId } = req.params;

    /*
        Get order
      */

    const order = await Order.findOne({
      internalOrderId: orderId,
    });

    if (!order) {
      const error = new Error("Order not found");

      error.statusCode = 404;
      error.code = "ORDER_NOT_FOUND";

      throw error;
    }

    /*
        Get courier partner
      */

    const CourierPartner = getCourierPartner(courier_partner);

    /*
        Track shipment
      */

    const response = await CourierPartner.trackOrder(order);

    /*
        Save tracking history
      */

    await TrackingHistory.create({
      internalOrderId: order.internalOrderId,

      courierPartner: courier_partner,

      status: response.status,

      rawPayload: response,
    });

    /*
        Update order status
      */

    await Order.findOneAndUpdate(
      {
        internalOrderId: orderId,
      },
      {
        status: response.status,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Tracking fetched successfully",

      data: response,
    });
  } catch (error) {
    logger({
      orderId: req.params.orderId,

      courierPartner: req.query?.courier_partner,

      requestId: req.headers["x-request-id"] || null,

      errorType: error.code || "TRACK_ORDER_FAILED",

      error,
    });

    return errorHandler(res, error);
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { courier_partner } = req.body;

    const { orderId } = req.params;

    /*
        Get order
      */

    const order = await Order.findOne({
      internalOrderId: orderId,
    });

    if (!order) {
      const error = new Error("Order not found");

      error.statusCode = 404;
      error.code = "ORDER_NOT_FOUND";

      throw error;
    }

    /*
        Get courier partner
      */

    const CourierPartner = getCourierPartner(courier_partner);

    /*
        Cancel shipment
      */

    const response = await CourierPartner.cancelOrder(order);

    /*
        Update order
      */

    await Order.findOneAndUpdate(
      {
        internalOrderId: orderId,
      },
      {
        status: response.status,
      },
    );

    /*
        Save tracking history
      */

    await TrackingHistory.create({
      internalOrderId: order.internalOrderId,

      courierPartner: courier_partner,

      status: response.status,

      rawPayload: response,
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",

      data: response,
    });
  } catch (error) {
    logger({
      orderId: req.params.orderId,

      courierPartner: req.body?.courier_partner,

      requestId: req.headers["x-request-id"] || null,

      errorType: error.code || "CANCEL_ORDER_FAILED",

      error,
    });

    return errorHandler(res, error);
  }
};

module.exports = {
  createOrder,
  trackOrder,
  cancelOrder,
};
