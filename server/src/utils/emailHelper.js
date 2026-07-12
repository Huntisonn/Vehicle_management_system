// src/utils/emailHelper.js
import nodemailer from 'nodemailer';
import logger from './logger.js';

const isSMTPConfigured = !!(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

const transporter = isSMTPConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

/**
 * Send a transactional email.
 * @param {object} opts
 * @param {string} opts.to
 * @param {string} opts.subject
 * @param {string} opts.html
 * @param {string} [opts.text]
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    if (!isSMTPConfigured) {
      logger.info(`[MOCK EMAIL SENT] To: ${to} | Subject: ${subject}`);
      logger.debug(`[MOCK EMAIL BODY]: ${html}`);
      return { messageId: 'mock-id-' + Date.now() };
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'RentiGo <noreply@rentigo.io>',
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email failed to ${to}: ${err.message}`);
    // Do not throw — email failure should never break the main flow
  }
};

/** Pre-built templates */
export const emailTemplates = {
  welcome: (name) => ({
    subject: 'Welcome to RentiGo 🚗',
    html: `
      <h2>Hi ${name},</h2>
      <p>Welcome to <strong>RentiGo</strong> — your trusted vehicle rental platform!</p>
      <p>Start exploring vehicles and book your first ride today.</p>
    `,
  }),

  resetPassword: (name, resetUrl) => ({
    subject: 'Reset your RentiGo password',
    html: `
      <h2>Hi ${name},</h2>
      <p>You requested a password reset. Click the button below (valid for 10 minutes):</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;">
        Reset Password
      </a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  }),

  bookingConfirmed: (name, bookingId, vehicle, dates) => ({
    subject: `Booking Confirmed — ${vehicle}`,
    html: `
      <h2>Hi ${name},</h2>
      <p>Your booking <strong>#${bookingId}</strong> for <strong>${vehicle}</strong> has been confirmed.</p>
      <p>Dates: ${dates.start} → ${dates.end}</p>
      <p>Thank you for choosing RentiGo!</p>
    `,
  }),

  ownerApproved: (name) => ({
    subject: 'Your owner account is approved! 🎉',
    html: `
      <h2>Hi ${name},</h2>
      <p>Congratulations! Your <strong>RentiGo owner account</strong> has been approved.</p>
      <p>You can now list your vehicles and start earning.</p>
    `,
  }),
};
