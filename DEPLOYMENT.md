# Backend Deployment Guide

## Chuẩn bị trước khi deploy

### 1. Kiểm tra file .gitignore
Đảm bảo file `.gitignore` đã có:
```
node_modules/
.env
dist/
logs/
*.log
```

### 2. Cập nhật package.json
Thêm scripts build và start cho production:
```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "postinstall": "npm run build"
  }
}
```

## Option 1: Deploy lên Render (Miễn phí, Khuyến nghị)

### Bước 1: Tạo tài khoản
1. Truy cập https://render.com
2. Đăng ký tài khoản (có thể dùng GitHub)

### Bước 2: Push code lên GitHub
```bash
cd Backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Bước 3: Tạo Web Service trên Render
1. Đăng nhập Render Dashboard
2. Click "New +" → "Web Service"
3. Connect GitHub repository của bạn
4. Chọn repository Backend
5. Cấu hình:
   - **Name**: fu-mate-backend
   - **Environment**: Node
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Branch**: main
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

### Bước 4: Thêm Environment Variables
Trong Render Dashboard, vào tab "Environment":
```
NODE_ENV=production
PORT=8080
MONGO_URI=<your-mongodb-atlas-uri>
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-refresh-secret>
CLIENT_URL_PROD=<your-frontend-url>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<your-app-password>
CLOUDINARY_CLOUD_NAME=<your-cloudinary-name>
CLOUDINARY_API_KEY=<your-cloudinary-key>
CLOUDINARY_API_SECRET=<your-cloudinary-secret>
```

### Bước 5: Deploy
- Click "Create Web Service"
- Render sẽ tự động build và deploy
- URL backend: `https://fu-mate-backend.onrender.com`

## Option 2: Deploy lên Railway

### Bước 1: Tạo tài khoản
1. Truy cập https://railway.app
2. Đăng ký với GitHub

### Bước 2: Deploy
1. Click "New Project"
2. Chọn "Deploy from GitHub repo"
3. Chọn repository Backend
4. Railway tự động detect Node.js và deploy

### Bước 3: Thêm Environment Variables
1. Vào Settings → Variables
2. Thêm tất cả biến môi trường như trên

### Bước 4: Lấy URL
- Railway tự động tạo domain: `https://<project-name>.up.railway.app`

## Option 3: Deploy lên Vercel (Serverless)

### Bước 1: Cài Vercel CLI
```bash
npm install -g vercel
```

### Bước 2: Tạo file vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

### Bước 3: Deploy
```bash
cd Backend
vercel
```

## Sau khi deploy

### 1. Test API
```bash
curl https://your-backend-url.com/api/health
```

### 2. Cập nhật MongoDB Atlas
- Vào MongoDB Atlas
- Network Access → Add IP Address
- Chọn "Allow Access from Anywhere" (0.0.0.0/0)

### 3. Lưu URL Backend
- Copy URL backend để cấu hình frontend
- Ví dụ: `https://fu-mate-backend.onrender.com`

## Troubleshooting

### Lỗi MongoDB Connection
- Kiểm tra MONGO_URI có đúng không
- Kiểm tra IP whitelist trên MongoDB Atlas
- Kiểm tra username/password

### Lỗi Build Failed
- Kiểm tra `npm run build` chạy được local không
- Kiểm tra tsconfig.json
- Xem logs trên Render/Railway

### Lỗi 502 Bad Gateway
- Kiểm tra PORT environment variable
- Đảm bảo server listen đúng port
- Xem logs để debug

## Monitoring

### Render
- Vào Dashboard → Logs để xem real-time logs
- Metrics tab để xem CPU/Memory usage

### Railway
- Vào Deployments → Logs
- Metrics tab

## Auto Deploy
- Mỗi khi push code lên GitHub branch main
- Render/Railway sẽ tự động build và deploy lại
