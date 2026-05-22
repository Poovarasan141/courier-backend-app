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

    if (!courier_partner || !order_id) {
      const error = new Error("Missing required fields");
      error.statusCode = 400;
      error.code = "INVALID_REQUEST";
      throw error;
    }

    // ✅ Idempotency check (enabled)
    const existingOrder = await Order.findOne({
      clientOrderId: order_id,
    });

    if (existingOrder) {
      return res.status(200).json({
        success: true,
        message: "Order already exists",
        data: existingOrder,
      });
    }

    const CourierPartner = getCourierPartner(courier_partner);

    if (!CourierPartner) {
      const error = new Error("Invalid courier partner");
      error.statusCode = 400;
      error.code = "INVALID_COURIER_PARTNER";
      throw error;
    }

    const courierResponse = await CourierPartner.createOrder(payload);

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

    // ❗ Safe failure logging (no crash risk)
    try {
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
    } catch (e) {
      logger({
        errorType: "FAILED_ORDER_LOGGING_FAILED",
        error: e,
      });
    }

    return errorHandler(res, error);
  }
};

const trackOrder = async (req, res) => {
  try {
    const { courier_partner } = req.query;
    const { orderId } = req.params;

    if (!courier_partner) {
      const error = new Error("courier_partner is required");
      error.statusCode = 400;
      error.code = "MISSING_COURIER_PARTNER";
      throw error;
    }

    const order = await Order.findOne({
      internalOrderId: orderId,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      error.code = "ORDER_NOT_FOUND";
      throw error;
    }

    const CourierPartner = getCourierPartner(courier_partner);

    const response = await CourierPartner.trackOrder(order);

    await TrackingHistory.create({
      internalOrderId: order.internalOrderId,
      courierPartner: courier_partner,
      status: response.status,
      rawPayload: response,
    });

    await Order.findOneAndUpdate(
      { internalOrderId: orderId },
      { status: response.status }
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

    if (!courier_partner) {
      const error = new Error("courier_partner is required");
      error.statusCode = 400;
      error.code = "MISSING_COURIER_PARTNER";
      throw error;
    }

    const order = await Order.findOne({
      internalOrderId: orderId,
    });

    if (!order) {
      const error = new Error("Order not found");
      error.statusCode = 404;
      error.code = "ORDER_NOT_FOUND";
      throw error;
    }

    const CourierPartner = getCourierPartner(courier_partner);

    const response = await CourierPartner.cancelOrder(order);

    await Order.findOneAndUpdate(
      { internalOrderId: orderId },
      { status: response.status }
    );

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

const bulkCreateOrders = async (req, res) => {
  const payload = req.body;

  try {
    const { orders } = payload;

    if (!Array.isArray(orders) || orders.length === 0) {
      const error = new Error("Orders array is required");
      error.statusCode = 400;
      error.code = "INVALID_REQUEST";
      throw error;
    }

    if (orders.length > 100) {
      const error = new Error("Max 100 orders allowed");
      error.statusCode = 400;
      error.code = "LIMIT_EXCEEDED";
      throw error;
    }

    const results = await Promise.allSettled(
      orders.map(async (payload) => {
        const { courier_partner, order_id } = payload;

        if (!courier_partner || !order_id) {
          return {
            order_id,
            success: false,
            error: "Missing required fields",
          };
        }

        // Idempotency check (same as single order)
        const existingOrder = await Order.findOne({
          clientOrderId: order_id,
        });

        if (existingOrder) {
          return {
            order_id,
            success: true,
            skipped: true,
            message: "Order already exists",
            data: existingOrder,
          };
        }

        const CourierPartner = getCourierPartner(courier_partner);

        if (!CourierPartner) {
          return {
            order_id,
            success: false,
            error: "Invalid courier partner",
          };
        }

        try {
          const courierResponse = await CourierPartner.createOrder(payload);

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

          await TrackingHistory.create({
            internalOrderId: order.internalOrderId,
            courierPartner: courier_partner,
            status: courierResponse.status,
            rawPayload: courierResponse,
          });

          return {
            order_id,
            success: true,
            data: order,
          };
        } catch (err) {
          return {
            order_id,
            success: false,
            error: err.message,
          };
        }
      })
    );

    const finalResults = results.map((r) => r.value);

    return res.status(200).json({
      success: true,
      message: "Bulk order processing completed",
      results: finalResults,
    });
  } catch (error) {
    logger({
      requestId: req.headers["x-request-id"] || null,
      errorType: error.code || "BULK_CREATE_ORDER_FAILED",
      error,
    });

    return errorHandler(res, error);
  }
};

module.exports = {
  createOrder,
  trackOrder,
  cancelOrder,
  bulkCreateOrders,
};