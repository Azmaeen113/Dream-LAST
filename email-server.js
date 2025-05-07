import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Email configuration
const EMAIL_FROM = 'priasa2016@gmail.com';
const APP_PASSWORD = 'vrau itfx tnbj zmrf';

// Create a nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: EMAIL_FROM,
    pass: APP_PASSWORD
  },
  debug: true, // Show debug output
  logger: true // Log information about the mail
});

// Verify the transporter
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed:', error);
  } else {
    console.log('Transporter is ready to send emails');
  }
});

// API endpoint to send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    console.log(`Sending OTP ${otp} to ${email}...`);

    // Email content
    const subject = 'Your DreamLand Group Password Reset OTP';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Password Reset OTP</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your DreamLand Group account. Use the following OTP to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 4px; display: inline-block; font-weight: bold; font-size: 24px; letter-spacing: 2px;">
            ${otp}
          </div>
        </div>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Best regards,<br>DreamLand Group Team</p>
      </div>
    `;

    const mailOptions = {
      from: `"DreamLand Group" <${EMAIL_FROM}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);

    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP', error: error.message });
  }
});

// API endpoint to send reset link
app.post('/api/send-reset-link', async (req, res) => {
  try {
    const { email, resetUrl } = req.body;

    if (!email || !resetUrl) {
      return res.status(400).json({ success: false, message: 'Email and reset URL are required' });
    }

    console.log(`Sending reset link to ${email}...`);

    // Email content
    const subject = 'Reset Your DreamLand Group Password';
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a5568;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your DreamLand Group account. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
        </div>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>DreamLand Group Team</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096;">
          <p>If you're having trouble clicking the button, copy and paste the URL below into your web browser:</p>
          <p>${resetUrl}</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"DreamLand Group" <${EMAIL_FROM}>`,
      to: email,
      subject: subject,
      html: htmlContent
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);

    res.json({ success: true, message: 'Reset link sent successfully' });
  } catch (error) {
    console.error('Error sending reset link:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset link', error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Email server running at http://localhost:${port}`);
});
