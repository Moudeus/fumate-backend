import { Request, Response, NextFunction } from "express";
import { ApiResponseWrapper } from "../interfaces/ApiResponseWrapper";

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json(ApiResponseWrapper.error("Unauthorized - No user found"));
    }

    // Admin bypass
    if (user.role === "admin") {
      return next();
    }

    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json(
        ApiResponseWrapper.error("Forbidden - Insufficient permissions")
      );
    }

    next();
  };
};

export default authorize;
