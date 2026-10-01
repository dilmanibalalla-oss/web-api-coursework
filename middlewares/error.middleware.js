function notFoundHandler(req, res) {
  res.status(404).json({
    code: "NOT_FOUND",
    message: "The requested resource was not found.",
    detail: `${req.method} ${req.originalUrl} does not exist.`
  });
}

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      code: "VALIDATION_ERROR",
      message: "The request contains invalid data.",
      detail: Object.values(err.errors)
        .map((error) => error.message)
        .join("; ")
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      code: "INVALID_ID",
      message: "The supplied identifier is invalid.",
      detail: err.message
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      code: "DUPLICATE_RESOURCE",
      message: "A resource with the same unique value already exists.",
      detail: JSON.stringify(err.keyValue)
    });
  }

  res.status(err.statusCode || 500).json({
    code: err.code || "INTERNAL_SERVER_ERROR",
    message: err.message || "An unexpected error occurred.",
    detail: err.detail || "No additional details are available."
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};