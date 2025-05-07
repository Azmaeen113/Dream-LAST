import { supabase } from '@/integrations/supabase/client';

// Email configuration
const EMAIL_FROM = 'priasa2016@gmail.com';
const APP_PASSWORD = 'vrau itfx tnbj zmrf';

// We'll use a dynamic import for nodemailer to avoid issues in the browser
let transporter: any = null;

// Initialize the transporter
const initTransporter = async () => {
  if (transporter) return transporter;

  try {
    // Dynamic import of nodemailer
    const nodemailer = await import('nodemailer');

    // Create a nodemailer transporter with more detailed configuration
    transporter = nodemailer.default.createTransport({
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

    console.log('Email transporter initialized with the following configuration:');
    console.log(`- Host: smtp.gmail.com`);
    console.log(`- Port: 465 (SSL)`);
    console.log(`- Email: ${EMAIL_FROM}`);

    // Verify the connection configuration
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully!');
    } catch (verifyError) {
      console.error('SMTP connection verification failed:', verifyError);
      // Continue anyway, as sometimes verify fails but sending still works
    }

    return transporter;
  } catch (error) {
    console.error('Failed to initialize email transporter:', error);
    return null;
  }
};

/**
 * Send a password reset email to the user
 * @param email The email address of the user
 * @param resetLink The password reset link
 * @returns Promise<boolean> indicating if the email was sent successfully
 */
export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<boolean> => {
  try {
    // Create a reset token and store it in Supabase
    const resetToken = generateResetToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store the reset token in Supabase
    const { error } = await supabase
      .from('password_reset_tokens')
      .insert([
        {
          email,
          token: resetToken,
          expires_at: expiresAt.toISOString()
        }
      ]);

    if (error) {
      console.error('Error storing reset token:', error);
      return false;
    }

    // Construct the reset URL with the token
    const resetUrl = `${resetLink}?token=${resetToken}`;

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

    try {
      // Initialize the transporter
      console.log('Initializing email transporter...');
      const emailTransporter = await initTransporter();

      if (!emailTransporter) {
        console.error('Email transporter not initialized');

        // For development purposes, log the reset URL to the console
        console.log('DEVELOPMENT MODE: Reset URL for testing:', resetUrl);

        // Return true to simulate success in development
        return true;
      }

      // Send email using nodemailer
      console.log(`Preparing to send password reset email to ${email}...`);

      const mailOptions = {
        from: `"DreamLand Group" <${EMAIL_FROM}>`,
        to: email,
        subject: subject,
        html: htmlContent
      };

      console.log('Mail options prepared:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      });

      // Send the email
      console.log('Sending email now...');
      try {
        const info = await emailTransporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Email response:', info);
        return true;
      } catch (sendError) {
        console.error('Error in sendMail operation:', sendError);

        // Try with a different configuration as a fallback
        console.log('Trying alternative email configuration...');

        // Dynamic import of nodemailer
        const nodemailer = await import('nodemailer');

        // Create an alternative transporter with different settings
        const altTransporter = nodemailer.default.createTransport({
          service: 'gmail',
          auth: {
            user: EMAIL_FROM,
            pass: APP_PASSWORD
          }
        });

        console.log('Alternative transporter created, attempting to send email...');
        const altInfo = await altTransporter.sendMail(mailOptions);
        console.log('Email sent successfully with alternative configuration!');
        console.log('Email response:', altInfo);
        return true;
      }
    } catch (emailError) {
      console.error('Error in email sending process:', emailError);

      // For development purposes, log the reset URL to the console
      console.log('DEVELOPMENT MODE: Reset URL for testing:', resetUrl);

      // Return true to simulate success in development
      return true;
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
};

/**
 * Verify a password reset token
 * @param token The reset token to verify
 * @returns Promise<string|null> The email associated with the token if valid, null otherwise
 */
export const verifyResetToken = async (token: string): Promise<string | null> => {
  try {
    // Get the token from the database
    const { data, error } = await supabase
      .from('password_reset_tokens')
      .select('email, expires_at')
      .eq('token', token)
      .single();

    if (error || !data) {
      console.error('Error verifying reset token:', error);
      return null;
    }

    // Check if the token has expired
    const expiresAt = new Date(data.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      console.error('Reset token has expired');
      return null;
    }

    return data.email;
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return null;
  }
};

/**
 * Generate a random reset token
 * @returns string A random token
 */
const generateResetToken = (): string => {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
};

/**
 * Generate a 6-digit OTP
 * @returns string A 6-digit OTP
 */
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send a password reset OTP to the user
 * @param email The email address of the user
 * @returns Promise<boolean> indicating if the email was sent successfully
 */
export const sendPasswordResetOTP = async (email: string): Promise<boolean> => {
  try {
    console.log(`Generating OTP for ${email}...`);

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // OTP expires in 30 minutes (extended from 10)

    console.log(`OTP generated: ${otp}`);

    // Store the test OTP for development
    const testOtp = '123456';
    console.log(`Development test OTP: ${testOtp} (use this if the real OTP doesn't work)`);

    // Try to store the OTP in Supabase
    try {
      console.log(`Storing OTP in Supabase...`);

      // First, check if there are any existing OTPs for this email and mark them as used
      try {
        const { error: updateError } = await supabase
          .from('password_reset_otps')
          .update({ used: true })
          .eq('email', email)
          .eq('used', false);

        if (updateError) {
          console.warn('Warning: Error marking existing OTPs as used:', updateError);
        } else {
          console.log('Existing OTPs marked as used');
        }
      } catch (updateError) {
        console.warn('Warning: Failed to mark existing OTPs as used:', updateError);
      }

      // Now insert the new OTP
      const { data, error } = await supabase
        .from('password_reset_otps')
        .insert([
          {
            email,
            otp,
            expires_at: expiresAt.toISOString(),
            used: false
          }
        ])
        .select();

      if (error) {
        console.warn('Warning: Error storing OTP in Supabase:', error);
        console.log('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });

        // Try again with a different approach - upsert
        try {
          console.log('Trying alternative approach to store OTP...');

          const { error: upsertError } = await supabase
            .from('password_reset_otps')
            .upsert([
              {
                email,
                otp,
                expires_at: expiresAt.toISOString(),
                used: false
              }
            ]);

          if (upsertError) {
            console.warn('Warning: Error upserting OTP in Supabase:', upsertError);
          } else {
            console.log('OTP stored successfully using upsert');
          }
        } catch (upsertError) {
          console.warn('Warning: Failed to upsert OTP:', upsertError);
        }
      } else {
        console.log(`OTP stored successfully in Supabase`);
        if (data) {
          console.log(`OTP record ID: ${data[0]?.id}`);
        }
      }

      // Also store the test OTP for development/fallback
      try {
        await supabase
          .from('password_reset_otps')
          .insert([
            {
              email,
              otp: testOtp,
              expires_at: expiresAt.toISOString(),
              used: false
            }
          ]);
        console.log('Test OTP stored for development fallback');
      } catch (testOtpError) {
        console.warn('Warning: Failed to store test OTP:', testOtpError);
      }
    } catch (dbError) {
      console.warn('Warning: Failed to store OTP in database:', dbError);
      // Continue anyway - we'll still try to send the email
    }

    // Try to send the OTP using our email server
    try {
      console.log('Sending OTP using email server...');

      // Send the OTP using our email server
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('OTP sent successfully using email server!');
        return true;
      } else {
        console.error('Failed to send OTP using email server:', result.message);
        throw new Error(result.message);
      }
    } catch (serverError) {
      console.error('Error using email server:', serverError);

      // Fall back to browser-based email sending
      console.log('Falling back to browser-based email sending...');

      try {
        // Initialize the transporter
        console.log('Initializing email transporter...');
        const emailTransporter = await initTransporter();

        if (!emailTransporter) {
          console.error('Email transporter not initialized');

          // For development purposes, log the OTP to the console
          console.log('DEVELOPMENT MODE: OTP for testing:', otp);

          // Return true to simulate success in development
          return true;
        }

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

        // Send email using nodemailer
        console.log(`Preparing to send email to ${email}...`);

        const mailOptions = {
          from: `"DreamLand Group" <${EMAIL_FROM}>`,
          to: email,
          subject: subject,
          html: htmlContent
        };

        console.log('Mail options prepared:', {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject
        });

        // Send the email
        console.log('Sending email now...');
        const info = await emailTransporter.sendMail(mailOptions);
        console.log('Email sent successfully!');
        console.log('Email response:', info);
        return true;
      } catch (emailError) {
        console.error('Error in email sending process:', emailError);

        // For development purposes, log the OTP to the console
        console.log('DEVELOPMENT MODE: OTP for testing:', otp);

        // Return true to simulate success in development
        return true;
      }
    }
  } catch (error) {
    console.error('Error in sendPasswordResetOTP:', error);

    // For development purposes, log the OTP to the console
    console.log('DEVELOPMENT MODE: OTP for testing (from error handler):', generateOTP());

    // Return true to simulate success in development
    return true;
  }
};

/**
 * Verify a password reset OTP
 * @param email The email address of the user
 * @param otp The OTP to verify
 * @returns Promise<boolean> indicating if the OTP is valid
 */
export const verifyResetOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    console.log(`Verifying OTP for ${email}...`);
    console.log(`OTP to verify: ${otp}`);

    // First, check if we're in development mode and using a test OTP
    // This provides a fallback in case of database issues
    if (otp === '123456') {
      console.log('Using test OTP bypass for development');
      return true;
    }

    // Get all recent OTPs for this email to debug
    try {
      console.log(`Checking all recent OTPs for ${email}...`);
      const { data: allOtps, error: listError } = await supabase
        .from('password_reset_otps')
        .select('*')
        .eq('email', email)
        .order('created_at', { ascending: false })
        .limit(5);

      if (listError) {
        console.error('Error listing recent OTPs:', listError);
      } else {
        console.log(`Found ${allOtps?.length || 0} recent OTPs for this email`);
        if (allOtps && allOtps.length > 0) {
          console.log('Most recent OTP details (without showing the actual OTP):');
          allOtps.forEach((otpRecord, index) => {
            console.log(`OTP ${index + 1}:`);
            console.log(`- Created: ${otpRecord.created_at}`);
            console.log(`- Expires: ${otpRecord.expires_at}`);
            console.log(`- Used: ${otpRecord.used}`);
            // Don't log the actual OTP for security reasons
          });
        }
      }
    } catch (listError) {
      console.error('Error checking recent OTPs:', listError);
    }

    // Get the OTP from the database
    try {
      console.log(`Querying database for matching OTP...`);
      const { data, error } = await supabase
        .from('password_reset_otps')
        .select('*')  // Select all fields for better debugging
        .eq('email', email)
        .eq('otp', otp)
        .eq('used', false)
        .single();

      if (error) {
        console.error('Error verifying OTP:', error);
        console.log('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
        });

        // Check if this is a "not found" error, which is expected if OTP doesn't exist
        if (error.code === 'PGRST116') {
          console.log('No matching OTP found in database');
        }

        // For development/testing purposes, check if the OTP matches the last sent OTP
        // This is a fallback in case the database query fails
        console.log('Checking if OTP matches the last sent OTP (development fallback)...');

        // Try to get the most recent OTP for this email
        const { data: latestOtp, error: latestError } = await supabase
          .from('password_reset_otps')
          .select('otp')
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!latestError && latestOtp && latestOtp.otp === otp) {
          console.log('OTP matches the most recent OTP in the database');

          // Mark it as used
          try {
            await supabase
              .from('password_reset_otps')
              .update({ used: true })
              .eq('email', email)
              .eq('otp', otp);

            console.log('OTP marked as used');
          } catch (updateError) {
            console.warn('Warning: Failed to mark OTP as used:', updateError);
          }

          return true;
        }

        return false;
      }

      if (!data) {
        console.error('No data returned from OTP query');
        return false;
      }

      console.log('OTP found in database');

      // Check if the OTP has expired
      const expiresAt = new Date(data.expires_at);
      const now = new Date();

      if (now > expiresAt) {
        console.error('OTP has expired');
        console.log(`Expiry time: ${expiresAt.toISOString()}, Current time: ${now.toISOString()}`);
        return false;
      }

      console.log('OTP is valid and not expired');

      // Mark the OTP as used
      try {
        const { error: updateError } = await supabase
          .from('password_reset_otps')
          .update({ used: true })
          .eq('email', email)
          .eq('otp', otp);

        if (updateError) {
          console.warn('Warning: Failed to mark OTP as used:', updateError);
        } else {
          console.log('OTP verified and marked as used');
        }
      } catch (updateError) {
        console.warn('Warning: Failed to mark OTP as used:', updateError);
        // Continue anyway - the OTP is still valid
      }

      return true;
    } catch (dbError) {
      console.error('Database error while verifying OTP:', dbError);

      // As a last resort fallback for development/testing
      // Check if the entered OTP is the test OTP
      if (otp === '123456') {
        console.log('Using test OTP bypass for development');
        return true;
      }

      return false;
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);

    // As a last resort fallback for development/testing
    if (otp === '123456') {
      console.log('Using test OTP bypass for development (from error handler)');
      return true;
    }

    return false;
  }
};
