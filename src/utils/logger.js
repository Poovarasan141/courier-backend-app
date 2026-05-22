const logger = ({
  orderId = null,
  courierPartner = null,
  requestId = null,
  errorType = "UNKNOWN_ERROR",
  error = null,
}) => {
  console.error({
    timestamp: new Date().toISOString(),

    order_id: orderId,

    courier_partner: courierPartner,

    request_id: requestId,

    error_type: errorType,

    message: error?.message,

    stack: error?.stack,
  });
};

module.exports = logger;
