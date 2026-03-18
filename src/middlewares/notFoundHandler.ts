import { Request, Response } from "express";
import { ApiResponseWrapper } from "../interfaces/ApiResponseWrapper";

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json(ApiResponseWrapper.error(`Route ${req.originalUrl} not found`));
};
