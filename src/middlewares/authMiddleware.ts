import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { jwtConfig } from "../config";
import UserModel, { IUser } from "../modules/users/user.model";

export interface AuthRequest extends Request {
  userId?: string;
  user?: IUser;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: "error", message: "Không có token xác thực" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, jwtConfig.secret) as { id: string };

    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ status: "error", message: "Người dùng không tồn tại" });
    }

    if (!user.isActive) {
      return res.status(401).json({ status: "error", message: "Tài khoản đã bị khóa" });
    }

    req.userId = decoded.id;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: "error", message: "Token không hợp lệ" });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ status: "error", message: "Chưa xác thực" });
    }

    const userRole = req.user.role || "user";
    if (!roles.includes(userRole)) {
      return res.status(403).json({ status: "error", message: "Không có quyền truy cập" });
    }

    next();
  };
};
