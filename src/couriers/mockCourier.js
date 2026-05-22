let accessToken = null;

const authenticate = async () => {
  accessToken = "token";
  return accessToken;
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

const createOrder = async (payload) => {
  const headers = await getHeaders();

  return {
    courier_order_id: "kyjhnesgestw",
    shipment_id: "uythtrhuyh",
    awb_number: "876543654",
    status: "CREATED",
    rawResponse: { payload, headers },
  };
};

const trackOrder = async (order) => {
  return {
    status: "success",
    rawResponse: order,
  };
};

const cancelOrder = async (order) => {
  return {
    status: "CANCELLED",
    rawResponse: order,
  };
};

module.exports = {
  authenticate,
  createOrder,
  trackOrder,
  cancelOrder,
};