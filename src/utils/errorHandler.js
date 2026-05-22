const errorHandler = (res, error) => {
  return res.status(error.statusCode || 500).json({
    success: false,

    error: {
      code: error.code || "INTERNAL_SERVER_ERROR",

      message: error.message || "Something went wrong",

      details: error.details || null,
    },
  });
};

module.exports = errorHandler;
