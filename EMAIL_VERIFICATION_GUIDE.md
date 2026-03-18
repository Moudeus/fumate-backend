# Email Verification Guide

## Overview

FU-Mate sử dụng email verification với OTP (One-Time Password) để xác thực tài khoản người dùng mới.

## Flow đăng ký và xác thực

### 1. Đăng ký tài khoản

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Nguyen",
  "lastName": "Van A"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
  "data": {
    "email": "user@example.com"
  }
}
```

**Điều gì xảy ra:**
1. Tạo user mới với `isVerified: false`
2. Generate OTP 6 số (valid trong 10 phút)
3. Lưu OTP vào `verificationOTP` và `verificationOTPExpires`
4. Gửi email chứa OTP đến địa chỉ email đăng ký
5. User chưa thể login cho đến khi verify

### 2. Xác thực OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Xác thực OTP thành công",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "_id": "...",
      "email": "user@example.com",
      "firstName": "Nguyen",
      "lastName": "Van A",
      "isVerified": true,
      "role": "user"
    }
  }
}
```

**Điều gì xảy ra:**
1. Kiểm tra OTP và expiry time
2. Set `isVerified: true`
3. Xóa `verificationOTP` và `verificationOTPExpires`
4. Generate access token và refresh token
5. Tự động login user

### 3. Gửi lại OTP

**Endpoint:** `POST /api/auth/resend-otp`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Mã OTP mới đã được gửi đến email của bạn"
}
```

**Điều gì xảy ra:**
1. Kiểm tra user tồn tại và chưa verified
2. Generate OTP mới
3. Update `verificationOTP` và `verificationOTPExpires`
4. Gửi email mới

## Email Configuration

### Environment Variables

Trong file `Backend/.env`:

```env
# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Gmail Setup

Nếu sử dụng Gmail:

1. **Bật 2-Step Verification:**
   - Vào Google Account Settings
   - Security → 2-Step Verification → Turn On

2. **Tạo App Password:**
   - Security → 2-Step Verification → App passwords
   - Select app: Mail
   - Select device: Other (Custom name)
   - Generate và copy password
   - Paste vào `EMAIL_PASS` trong .env

3. **Không dùng mật khẩu Gmail thật!**
   - Phải dùng App Password
   - Format: `xxxx xxxx xxxx xxxx` (16 ký tự, có thể có hoặc không có space)

## Email Template

Email OTP có format:

```
Subject: FU-Mate - Mã xác thực OTP

Body:
┌─────────────────────────────┐
│         FU-Mate Logo        │
│                             │
│  Mã xác thực tài khoản      │
│                             │
│  Chào bạn! Sử dụng mã OTP   │
│  dưới đây để xác thực:      │
│                             │
│      ┌─────────────┐        │
│      │   123456    │        │
│      └─────────────┘        │
│                             │
│  Mã có hiệu lực 10 phút     │
│                             │
│  © 2024 FU-Mate             │
└─────────────────────────────┘
```

## Security Features

### OTP Security
- **6 digits** random number
- **10 minutes** expiry time
- **One-time use** - cleared after verification
- Stored in database (not in JWT)

### Login Protection
- User không thể login nếu `isVerified: false`
- Error message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản."

### Rate Limiting (Recommended)
Nên thêm rate limiting cho:
- `/api/auth/register` - Max 3 requests/hour per IP
- `/api/auth/resend-otp` - Max 5 requests/hour per email

## Testing

### Manual Testing

1. **Test đăng ký:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

2. **Kiểm tra email** - Lấy OTP từ inbox

3. **Test verify OTP:**
```bash
curl -X POST http://localhost:8080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

4. **Test resend OTP:**
```bash
curl -X POST http://localhost:8080/api/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Database Check

```javascript
// Check user verification status
db.users.findOne({ email: "test@example.com" })

// Should see:
{
  email: "test@example.com",
  isVerified: false,  // Before verification
  verificationOTP: "123456",
  verificationOTPExpires: ISODate("2024-...")
}

// After verification:
{
  email: "test@example.com",
  isVerified: true,
  verificationOTP: undefined,
  verificationOTPExpires: undefined
}
```

## Error Handling

### Common Errors

**Email already registered:**
```json
{
  "success": false,
  "message": "Email đã được đăng ký"
}
```

**Invalid or expired OTP:**
```json
{
  "success": false,
  "message": "Mã OTP không hợp lệ hoặc đã hết hạn"
}
```

**Email send failure:**
- Registration still succeeds
- User can request resend OTP
- Error logged in console

**User tries to login without verification:**
```json
{
  "success": false,
  "message": "Tài khoản chưa được xác thực. Vui lòng kiểm tra email để xác thực tài khoản."
}
```

## Frontend Integration

### Registration Flow

```typescript
// 1. Register
const registerResponse = await axios.post('/api/auth/register', {
  email,
  password,
  firstName,
  lastName
});

// 2. Navigate to OTP verification screen
navigation.navigate('VerifyOTP', { email });

// 3. Verify OTP
const verifyResponse = await axios.post('/api/auth/verify-otp', {
  email,
  otp
});

// 4. Save tokens and navigate to home
await AsyncStorage.setItem('accessToken', verifyResponse.data.data.accessToken);
await AsyncStorage.setItem('refreshToken', verifyResponse.data.data.refreshToken);
navigation.navigate('Home');
```

### Resend OTP

```typescript
const handleResendOTP = async () => {
  try {
    await axios.post('/api/auth/resend-otp', { email });
    Alert.alert('Thành công', 'Mã OTP mới đã được gửi');
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể gửi lại OTP');
  }
};
```

## Troubleshooting

### Email không được gửi

1. **Check .env file:**
   - Đảm bảo `EMAIL_USER` và `EMAIL_PASS` đúng
   - App Password phải là 16 ký tự

2. **Check console logs:**
   ```
   Failed to send OTP email: Error: ...
   ```

3. **Test SMTP connection:**
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
     }
   });
   
   await transporter.verify();
   ```

4. **Gmail security:**
   - Kiểm tra "Less secure app access" (nếu không dùng App Password)
   - Kiểm tra "Allow less secure apps" trong Gmail settings

### OTP expired

- OTP có hiệu lực 10 phút
- User có thể request resend OTP
- Mỗi lần resend sẽ generate OTP mới

### User không nhận được email

1. Check spam folder
2. Verify email address đúng
3. Check email service status
4. Try resend OTP

## Best Practices

✅ **Do:**
- Sử dụng App Password cho Gmail
- Set reasonable OTP expiry (10 minutes)
- Clear OTP sau khi verify
- Log email errors cho debugging
- Implement rate limiting

❌ **Don't:**
- Không dùng mật khẩu Gmail thật
- Không expose OTP trong response
- Không allow unlimited resend
- Không skip email verification
- Không store OTP in plain text (đã hash trong production)

## Future Enhancements

- [ ] Add email templates với HTML/CSS đẹp hơn
- [ ] Support multiple email providers (SendGrid, AWS SES)
- [ ] Add SMS OTP option
- [ ] Implement rate limiting middleware
- [ ] Add email verification reminder
- [ ] Track verification attempts
- [ ] Add admin dashboard for monitoring
