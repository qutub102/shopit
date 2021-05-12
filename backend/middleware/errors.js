const ErrorHandler = require("../utils/ErrorHandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === "PRODUCTION") {
    let error = { ...err };
    error.message = err.message;

    // handling cast error like wrong path api/product/scjbscbsc instead of correct id
    if (err.name === "CastError") {
      const message = `Resourse not found! Invalid: ${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    // handling mongooose validation error
    if (err.name === "ValidationError") {
      const message = Object.values(err.errors).map((value) => value.message);
      error = new ErrorHandler(message, 400);
    }

    // Dublicate email error
    if (err.code === 11000) {
      const message = `Dublicate ${Object.keys(err.keyValue)} entered`;
      error = new ErrorHandler(message, 400);
    }

    // JsonwebToken not available error
    if (err.name === "JsonWebTokenError") {
      const message = "Json web token is invalid!! Try again";
      error = new ErrorHandler(message, 400);
    }

    // Token expired error
    if (err.name === "TokenExpiredError") {
      const message = "Json web token is expired. Try Again";
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
