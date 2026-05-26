const nodemailer = require('nodemailer');

let transporter;

const getTransporter = () => {
    if (!process.env.SMTP_HOST) {
        return null;
    }

    if (!transporter) {
        const auth =
            process.env.SMTP_USER && process.env.SMTP_PASS
                ? {
                      user: process.env.SMTP_USER,
                      pass: process.env.SMTP_PASS
                  }
                : undefined;

        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_SECURE === 'true',
            auth
        });
    }

    return transporter;
};

const escapeHtml = (value = '') => {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const verificationEmailTemplate = ({ name, verificationUrl }) => {
    const safeName = escapeHtml(name || 'User');
    const safeUrl = escapeHtml(verificationUrl);

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Email Verification</title>
        </head>

        <body style="margin:0; padding:0; background-color:#f4f7fb; font-family:Arial, Helvetica, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb; padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                            
                            <tr>
                                <td style="background:#2563eb; padding:28px; text-align:center;">
                                    <h1 style="margin:0; color:#ffffff; font-size:26px;">
                                        Verify Your Email
                                    </h1>
                                </td>
                            </tr>

                            <tr>
                                <td style="padding:32px;">
                                    <h2 style="margin:0 0 16px; color:#111827; font-size:22px;">
                                        Hi ${safeName},
                                    </h2>

                                    <p style="margin:0 0 18px; color:#4b5563; font-size:16px; line-height:1.6;">
                                        Thank you for creating an account. Please verify your email address to activate your account.
                                    </p>

                                    <p style="margin:0 0 28px; color:#4b5563; font-size:16px; line-height:1.6;">
                                        Click the button below to complete your email verification.
                                    </p>

                                    <div style="text-align:center; margin:32px 0;">
                                        <a href="${safeUrl}"
                                           style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:14px 28px; border-radius:8px; font-size:16px; font-weight:bold;">
                                            Verify Email
                                        </a>
                                    </div>

                                    <p style="margin:0 0 12px; color:#6b7280; font-size:14px; line-height:1.6;">
                                        This verification link will expire in 24 hours.
                                    </p>

                                    <p style="margin:0 0 12px; color:#6b7280; font-size:14px; line-height:1.6;">
                                        If the button does not work, copy and paste this link into your browser:
                                    </p>

                                    <p style="word-break:break-all; color:#2563eb; font-size:14px; line-height:1.6;">
                                        <a href="${safeUrl}" style="color:#2563eb;">
                                            ${safeUrl}
                                        </a>
                                    </p>

                                    <hr style="border:none; border-top:1px solid #e5e7eb; margin:28px 0;" />

                                    <p style="margin:0; color:#9ca3af; font-size:13px; line-height:1.6;">
                                        If you did not create this account, you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>

                            <tr>
                                <td style="background:#f9fafb; padding:20px; text-align:center;">
                                    <p style="margin:0; color:#9ca3af; font-size:13px;">
                                        © ${new Date().getFullYear()} Your Company. All rights reserved.
                                    </p>
                                </td>
                            </tr>

                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

const sendVerificationEmail = async ({ to, name, verificationUrl }) => {
    const mailTransporter = getTransporter();

    if (!mailTransporter) {
        console.log(
            `[email verification] Configure SMTP to send email. Verification link for ${to}: ${verificationUrl}`
        );

        return { skipped: true };
    }

    return mailTransporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com',
        to,
        subject: 'Verify your email address',
        text: `Hi ${name || 'User'}, please verify your email by opening this link: ${verificationUrl}. This link will expire in 24 hours.`,
        html: verificationEmailTemplate({
            name,
            verificationUrl
        })
    });
};

const resetPasswordEmailTemplate = ({ name, otp }) => {
    const safeName = escapeHtml(name || 'User');
    const safeOtp = escapeHtml(otp);

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Reset Password</title>
        </head>
        <body style="margin:0; padding:0; background-color:#f4f7fb; font-family:Arial, Helvetica, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb; padding:40px 0;">
                <tr>
                    <td align="center">
                        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
                            <tr>
                                <td style="background:#2563eb; padding:28px; text-align:center;">
                                    <h1 style="margin:0; color:#ffffff; font-size:26px;">
                                        Reset Your Password
                                    </h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:32px;">
                                    <h2 style="margin:0 0 16px; color:#111827; font-size:22px;">
                                        Hi ${safeName},
                                    </h2>
                                    <p style="margin:0 0 18px; color:#4b5563; font-size:16px; line-height:1.6;">
                                        You recently requested to reset your password for your account. Please use the One-Time Password (OTP) below to reset it. <strong>This OTP is valid for the next 1 hour.</strong>
                                    </p>
                                    <div style="text-align:center; margin:32px 0;">
                                        <span style="display:inline-block; background:#f3f4f6; color:#111827; padding:14px 28px; border-radius:8px; font-size:24px; font-weight:bold; letter-spacing:4px; border:1px dashed #d1d5db;">
                                            ${safeOtp}
                                        </span>
                                    </div>
                                    <hr style="border:none; border-top:1px solid #e5e7eb; margin:28px 0;" />
                                    <p style="margin:0; color:#9ca3af; font-size:13px; line-height:1.6;">
                                        If you did not request a password reset, please ignore this email or contact support if you have questions.
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background:#f9fafb; padding:20px; text-align:center;">
                                    <p style="margin:0; color:#9ca3af; font-size:13px;">
                                        © ${new Date().getFullYear()} Your Company. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

const sendResetPasswordEmail = async ({ to, name, otp }) => {
    const mailTransporter = getTransporter();

    if (!mailTransporter) {
        console.log(
            `[reset password] Configure SMTP to send email. OTP for ${to}: ${otp}`
        );

        return { skipped: true };
    }

    return mailTransporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER || 'no-reply@example.com',
        to,
        subject: 'Reset your password - OTP',
        text: `Hi ${name || 'User'}, your password reset OTP is: ${otp}. This OTP will expire in 1 hour.`,
        html: resetPasswordEmailTemplate({
            name,
            otp
        })
    });
};

module.exports = {
    sendVerificationEmail,
    sendResetPasswordEmail
};