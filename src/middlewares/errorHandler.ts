import { Request, Response, NextFunction } from "express";
import { ApiResponseWrapper } from "../interfaces/ApiResponseWrapper";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json(ApiResponseWrapper.error("Validation Error", messages.join(", ")));
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json(ApiResponseWrapper.error(`${field} đã tồn tại`));
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json(ApiResponseWrapper.error("ID không hợp lệ"));
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json(ApiResponseWrapper.error("Token không hợp lệ"));
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json(ApiResponseWrapper.error("Token đã hết hạn"));
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json(ApiResponseWrapper.error(message));
};

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ApiResponseWrapper.error("Endpoint không tồn tại"));
};
