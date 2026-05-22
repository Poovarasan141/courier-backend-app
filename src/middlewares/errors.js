const errorMiddleware = (err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
    error: {
      code: err.code || "INTERNAL_SERVER_ERROR",
      details: err.errors || null,
    },
  });
};

module.exports = errorMiddleware;