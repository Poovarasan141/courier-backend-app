const Router = require("express-promise-router");

const controller = require("../controllers/orderController");
const validate = require("../middlewares/validation");

const { createOrderSchema } = require("../validations/orderValidation");

module.exports = () => {
  const router = Router({
    mergeParams: true,
  });

  router.route("/").post(validate(createOrderSchema), controller.createOrder);

  router.route("/:orderId/track").get(controller.trackOrder);

  router.route("/:orderId/cancel").post(controller.cancelOrder);

  router.post("/api/v1/orders/bulk", controller.bulkCreateOrders);

  return router;
};
