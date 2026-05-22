const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: error.details.map((item) => ({
            field: item.path[0],
            message: item.message,
          })),
        },
      });
    }

    next();
  };
};

module.exports = validate;