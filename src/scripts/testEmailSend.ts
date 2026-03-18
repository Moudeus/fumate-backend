import dotenv from 'dotenv';
import { MailService } from '../modules/mail/mail.service';

dotenv.config();

/**
 * Test script to verify email sending functionality
 */
async function testEmailSend() {
  try {
    console.log('=== Testing Email Send ===\n');
    
    // Check environment variables
    console.log('Email Configuration:');
    console.log(`  HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
    console.log(`  PORT: ${process.env.EMAIL_PORT || 'NOT SET'}`);
    console.log(`  USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
    console.log(`  PASS: ${process.env.EMAIL_PASS ? '***SET***' : 'NOT SET'}`);
    console.log('');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email credentials not configured in .env file');
      console.log('\nPlease set:');
      console.log('  EMAIL_HOST=smtp.gmail.com');
      console.log('  EMAIL_PORT=587');
      console.log('  EMAIL_USER=your-email@gmail.com');
      console.log('  EMAIL_PASS=your-app-password');
      return;
    }

    // Generate test OTP
    const testOTP = '123456';
    const testEmail = process.env.EMAIL_USER; // Send to self for testing

    console.log(`Sending test OTP to: ${testEmail}`);
    console.log(`Test OTP: ${testOTP}\n`);

    // Send email
    await MailService.sendOTPToken(testEmail, testOTP);

    console.log('✅ Email sent successfully!');
    console.log('\nPlease check your inbox for the OTP email.');
    console.log('If you don\'t see it, check your spam folder.\n');

  } catch (error: any) {
    console.error('❌ Failed to send email:', error.message);
    console.error('\nCommon issues:');
    console.error('  1. Gmail App Password not set correctly');
    console.error('  2. 2-Step Verification not enabled on Gmail');
    console.error('  3. "Less secure app access" blocked');
    console.error('  4. Network/firewall blocking SMTP port 587');
    console.error('\nFull error:', error);
  }
}

// Run the test
if (require.main === module) {
  testEmailSend()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

export { testEmailSend };
