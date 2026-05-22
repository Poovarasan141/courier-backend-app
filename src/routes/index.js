const Router = require("express-promise-router");

const orderRoutes = require("./orderRoutes");

module.exports = () => {
  const router = Router({
    mergeParams: true,
  });

  router.use("/orders", orderRoutes());

  return router;
};
