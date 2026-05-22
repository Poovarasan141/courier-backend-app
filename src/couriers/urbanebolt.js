const axios = require("axios");

const logger = require("../utils/logger");

const BASE_URL = process.env.URBANEBOLT_BASE_URL;

let accessToken = null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryRequest = async (
  callback,
  retries = Number(process.env.RETRY_COUNT) || 3,
  delay = 1000,
) => {
  try {
    return await callback();
  } catch (error) {
    const isRetryable = !error.response || error.response?.status >= 500;

    if (!isRetryable || retries === 0) {
      throw error;
    }

    await wait(delay);

    return retryRequest(callback, retries - 1, delay * 2);
  }
};

/* Authentication */

const authenticate = async () => {
  try {
    const response = await axios.post(
      `${BASE_URL}/auth/getToken/`,
      {
        username: process.env.URBANEBOLT_USERNAME,

        password: process.env.URBANEBOLT_PASSWORD,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: Number(process.env.REQUEST_TIMEOUT),
      },
    );

    accessToken = response.data.token;

    return accessToken;
  } catch (error) {
    logger({
      courierPartner: "urbanebolt",

      errorType: "AUTH_ERROR",

      error,
    });

    const authError = new Error("Courier authentication failed");

    authError.statusCode = 401;

    authError.code = "COURIER_AUTH_FAILED";

    throw authError;
  }
};

const getHeaders = async () => {
  if (!accessToken) {
    await authenticate();
  }

  return {
    Authorization: `Bearer ${accessToken}`,

    "Content-Type": "application/json",
  };
};

/* Create Order */

const createOrder = async (payload) => {
  try {
    const headers = await getHeaders();

    const requestPayload = [
      {
        customerCode: process.env.URBANEBOLT_CUSTOMER_CODE,
        orderNumber: payload.order_id,
        declaredValue: payload.amount,
        itemDescription: payload.item_description || "ITEM",
        collectableValue: payload.amount,
        height: payload.height,
        length: payload.length || 10,
        breadth: payload.breadth || 10,
        weight: payload.weight || 1,
        serviceType: "SDD",
        payMode: "COD",
        rtnCity: payload.city,
        rtnName: "Warehouse",
        consCity: payload.city,
        consName: payload.customer_name,
        rtnEmail: "warehouse@test.com",
        consEmail: payload.customer_email,
        rtnState: payload.state,
        consState: payload.state,
        rtnMobile: "9999999999",
        consMobile: payload.customer_phone,
        rtnAddress: "Warehouse Address",
        rtnAddressType: "Seller",
        rtnCountry: "INDIA",
        rtnPincode: payload.pincode,
        consAddress: payload.address,
        consAddressType: "Home",
        consCountry: "INDIA",
        consPincode: payload.pincode,
        invoiceNumber: payload.order_id,
        invoiceDate: new Date().toISOString().split("T")[0],
        shprAddress: "Warehouse Address",
        shprAddressType: "Seller",
        shprCountry: "INDIA",
        shprPincode: payload.pincode,
        invoiceValue: payload.amount,
        itemQuantity: 1,
      },
    ];

    const response = await retryRequest(() =>
      axios.post(`${BASE_URL}/services/manifest/`, requestPayload, {
        headers,
        timeout: Number(process.env.REQUEST_TIMEOUT),
      }),
    );

    const shipment = response.data?.[0] || {};

    return {
      courier_order_id: shipment.orderNumber,

      shipment_id: shipment.shipmentId || null,

      awb_number: shipment.awb || null,

      status: "CREATED",

      rawResponse: response.data,
    };
  } catch (error) {
    if (error.response?.status === 401) {
      accessToken = null;

      await authenticate();

      return createOrder(payload);
    }

    logger({
      orderId: payload.order_id,

      courierPartner: "urbanebolt",

      errorType: "CREATE_ORDER_FAILED",

      error,
    });

    const statusCode = error.response?.status;

    if (statusCode >= 400 && statusCode < 500) {
      const courierError = new Error("Courier request failed");

      courierError.statusCode = 400;

      courierError.code = "COURIER_REQUEST_FAILED";

      throw courierError;
    }

    const serviceError = new Error("Courier service unavailable");

    serviceError.statusCode = 503;

    serviceError.code = "COURIER_SERVICE_UNAVAILABLE";

    throw serviceError;
  }
};

/* Track Order */

const trackOrder = async (order) => {
  try {
    const headers = await getHeaders();

    const response = await retryRequest(() =>
      axios.get(`${BASE_URL}/services/tracking-pub/?awb=${order.awbNumber}`, {
        headers,
        timeout: Number(process.env.REQUEST_TIMEOUT),
      }),
    );

    return {
      status: response.data?.status || "UNKNOWN",

      rawResponse: response.data,
    };
  } catch (error) {
    logger({
      orderId: order.clientOrderId,

      courierPartner: "urbanebolt",

      errorType: "TRACK_ORDER_FAILED",

      error,
    });

    throw new Error("Failed to track shipment");
  }
};

/* Cancel Order */

const cancelOrder = async (order) => {
  try {
    const headers = await getHeaders();

    const response = await retryRequest(() =>
      axios.post(
        `${BASE_URL}/services/cancel/`,
        {
          awbs: order.awbNumber,
        },
        {
          headers,
          timeout: Number(process.env.REQUEST_TIMEOUT),
        },
      ),
    );

    return {
      status: "CANCELLED",

      rawResponse: response.data,
    };
  } catch (error) {
    logger({
      orderId: order.clientOrderId,

      courierPartner: "urbanebolt",

      errorType: "CANCEL_ORDER_FAILED",

      error,
    });

    throw new Error("Failed to cancel shipment");
  }
};

module.exports = {
  authenticate,
  createOrder,
  trackOrder,
  cancelOrder,
};
