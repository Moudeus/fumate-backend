export const jwtConfig = {
  secret: process.env.JWT_SECRET || "super-secret-key-change-in-production",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
};

export const emailConfig = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
};

export const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
};
