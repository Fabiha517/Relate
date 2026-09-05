'use strict';

const nodemailer = require('nodemailer');
const env = require('../../config/env');

/**
 * email.service.js — Password reset email service via Nodemailer
 *
 * Sends transactional password reset emails using SMTP configuration
 * from environment variables. The plaintext reset token appears ONLY
 * in the email URL — never in logs, console output, or stored data.
 *
 * Requirements: 16.12 (email service), 16.13 (reset email flow), 16.16 (no plaintext logging)
 */

let transporter = null;

/**
 * Initialize or retrieve the Nodemailer SMTP transporter.
 * Lazily created on first use.
 *
 * @returns {object} Configured Nodemailer transporter
 */
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || 587),
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

/**
 * Compose HTML content for password reset email.
 * The plaintext token appears only in the resetUrl; not stored or logged elsewhere.
 *
 * @param {string} resetUrl - Full reset URL including plaintext token query param
 * @returns {string} HTML email body
 */
function composeResetEmailHtml(resetUrl) {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f0e8; }
      .card { background: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      .logo { font-size: 24px; font-weight: bold; color: #5b4fcf; margin-bottom: 24px; }
      .heading { font-size: 20px; font-weight: 600; color: #1a1a2e; margin-bottom: 16px; }
      .body-text { font-size: 16px; color: #1a1a2e; margin-bottom: 16px; }
      .cta-button { display: inline-block; background: #5b4fcf; color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
      .cta-button:hover { background: #4a3fb8; }
      .warning-text { font-size: 14px; color: #6b6b8a; margin-top: 24px; font-style: italic; }
      .footer { font-size: 13px; color: #6b6b8a; margin-top: 32px; padding-top: 16px; border-top: 1px solid #ede8df; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <div class="logo">Relate</div>

        <h1 class="heading">Reset Your Password</h1>

        <p class="body-text">
          We received a request to reset your password. Click the link below to create a new password.
          This link will expire in 1 hour.
        </p>

        <div style="text-align: center;">
          <a href="${resetUrl}" class="cta-button">Reset Password</a>
        </div>

        <p class="body-text">
          Or copy and paste this link in your browser:<br>
          <code style="word-break: break-all; background: #f5f0e8; padding: 8px; display: block; margin-top: 8px;">${resetUrl}</code>
        </p>

        <p class="warning-text">
          <strong>Didn't request a password reset?</strong> You can safely ignore this email. Your password will not change unless you use the link above.
        </p>

        <div class="footer">
          <p>
            This is an automated message from Relate. Please do not reply to this email.
          </p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim();
}

/**
 * Compose plain text content for password reset email.
 * Used as a fallback for email clients that don't support HTML.
 *
 * @param {string} resetUrl - Full reset URL including plaintext token query param
 * @returns {string} Plain text email body
 */
function composeResetEmailText(resetUrl) {
  return `
Relate — Password Reset

Reset Your Password

We received a request to reset your password. Click the link below to create a new password.
This link will expire in 1 hour.

${resetUrl}

Didn't request a password reset?
You can safely ignore this email. Your password will not change unless you use the link above.

This is an automated message from Relate. Please do not reply to this email.
  `.trim();
}

/**
 * Send a password reset email.
 *
 * @param {object} options
 * @param {string} options.to        - Recipient email address
 * @param {string} options.resetUrl  - Full reset URL containing the plaintext token
 * @returns {Promise<void>}
 * @throws {Error} If email sending fails; error message does NOT expose plaintext token
 *
 * Requirements: 16.12 (email service), 16.13 (reset email flow), 16.16 (no plaintext token in logs)
 */
async function sendPasswordResetEmail({ to, resetUrl }) {
  if (!to || !resetUrl) {
    throw new Error('Email recipient and reset URL are required');
  }

  try {
    const transporter = getTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@relate.app',
      to: to,
      subject: 'Reset Your Relate Password',
      text: composeResetEmailText(resetUrl),
      html: composeResetEmailHtml(resetUrl)
    };

    // Send the email via Nodemailer
    await transporter.sendMail(mailOptions);

    // Log success without exposing the plaintext token or resetUrl
    console.log(`[EmailService] Password reset email sent to: ${to}`);
    // NOTE: resetUrl (containing plaintext token) is NEVER logged — Requirement 16.16
  } catch (error) {
    // Log error details for debugging, but NEVER expose the plaintext token or resetUrl
    console.error(`[EmailService] Failed to send password reset email to ${to}: ${error.message}`);
    // Do NOT log error.response, error.command, or the full error object — these may expose credentials
    throw new Error('Email could not be sent. Please try again later.');
  }
}

module.exports = { sendPasswordResetEmail };
