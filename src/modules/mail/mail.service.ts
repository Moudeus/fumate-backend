import nodemailer from "nodemailer";

function randomInt(min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min)) + min;
}

export class MailService {
  /**
   * @param email
   * @param token - The OTP token to send
   * @returns
   */
  static async sendOTPToken(email: string, token: string): Promise<void> {
    const host = process.env.EMAIL_HOST || process.env.SMTP_HOST || "smtp.gmail.com";
    const port = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || 587);
    const user = process.env.EMAIL_USER || process.env.SMTP_USER || "";
    const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS || "";

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const subject = "FU-Mate - Mã xác thực OTP";
    const html = MailService.buildEmailContent(token);

    try {
      await transporter.sendMail({
        from: `"FU-Mate" <${user}>`,
        to: email,
        subject,
        html,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * @param email
   * @returns
   */
  static async generateAndSendToken(email: string): Promise<string> {
    const token = String(100000 + randomInt(900000));
    await MailService.sendOTPToken(email, token);
    return token;
  }

  private static buildEmailContent(token: string): string {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body { font-family: Arial, sans-serif; text-align: center; padding: 0; margin: 0; background-color: #f5f5f5; }
      .container { padding: 30px; max-width: 600px; margin: 24px auto; border: 1px solid #eee; border-radius: 12px; background-color: white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .logo { width: 80px; height: 64px; margin: 0 auto 16px; background-color: #FF6B35; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
      .logo-text { color: white; font-size: 24px; font-weight: bold; }
      .title { color: #1F2937; font-size: 24px; font-weight: bold; margin: 16px 0; }
      .subtitle { color: #6B7280; font-size: 16px; margin-bottom: 24px; }
      .token { font-size: 32px; font-weight: 700; color: #FF6B35; margin: 24px 0; padding: 16px; background-color: #FFF7F5; border-radius: 8px; letter-spacing: 4px; }
      .note { color: #6B7280; font-size: 14px; margin: 16px 0; }
      .footer { margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB; font-size: 12px; color: #9CA3AF; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">
        <span class="logo-text">FU</span>
      </div>
      <h1 class="title">FU-Mate</h1>
      <p class="subtitle">Mã xác thực tài khoản</p>
      <p>Chào bạn! Sử dụng mã OTP dưới đây để xác thực tài khoản FU-Mate của bạn:</p>
      <div class="token">${token}</div>
      <p class="note">Mã này có hiệu lực trong 10 phút.</p>
      <p class="note">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
      <div class="footer">
        <p>© 2024 FU-Mate - Grow together as mates</p>
        <p>Đây là email tự động, vui lòng không trả lời email này.</p>
      </div>
    </div>
  </body>
</html>`;
  }
}

export default MailService;
