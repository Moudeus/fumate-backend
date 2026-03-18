require("dotenv").config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { connectDB } from "./config/db";
import router from "./routes";
import { notFoundHandler } from "./middlewares/errorHandler";
import { errorHandler } from "./middlewares/errorHandler";
import logger from "./utils/logger";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS Configuration
const isProduction = process.env.NODE_ENV === "production";
const origin = isProduction ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV;

app.use(
  cors({
    origin,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Logging
if (!isProduction) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Database Connection
connectDB();

// Routes
app.use("/api", router);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT} in ${isProduction ? "production" : "development"} mode`);
  logger.info(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
