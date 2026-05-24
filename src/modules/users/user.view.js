const { logError } = require('../../shared/utils/logError');

const wantsHtml = (req) => {
    return req.headers.accept && req.headers.accept.includes('text/html');
};

const escapeHtml = (value) => {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const renderVerificationPage = ({ title, message, status = 'success' }) => {
    const isSuccess = status === 'success';
    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);

    return `
        <!doctype html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>${safeTitle}</title>
            <style>
                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    min-height: 100vh;
                    font-family: Arial, sans-serif;
                    background: #f4f7fb;
                    color: #1f2937;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .modal {
                    width: min(100%, 440px);
                    background: #ffffff;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
                    padding: 32px;
                    text-align: center;
                }

                .icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    margin: 0 auto 18px;
                    display: grid;
                    place-items: center;
                    background: ${isSuccess ? '#dcfce7' : '#fee2e2'};
                    color: ${isSuccess ? '#15803d' : '#b91c1c'};
                    font-size: 24px;
                    font-weight: 700;
                }

                h1 {
                    margin: 0 0 10px;
                    font-size: 28px;
                    line-height: 1.2;
                }

                p {
                    margin: 0;
                    color: #4b5563;
                    font-size: 16px;
                    line-height: 1.6;
                }
            </style>
        </head>
        <body>
            <main class="modal">
                <div class="icon">${isSuccess ? 'OK' : '!'}</div>
                <h1>${safeTitle}</h1>
                <p>${safeMessage}</p>
            </main>
        </body>
        </html>
    `;
};

const verifyEmailSuccess = (req, res, data) => {
    if (wantsHtml(req)) {
        return res.status(200).send(renderVerificationPage({
            title: 'Thank you!',
            message: 'Your email has been verified successfully. Your account is now active.'
        }));
    }

    return res.status(200).json({
        success: true,
        message: 'Email verified successfully. Your account is now active.',
        data
    });
};

const verifyEmailError = async (req, res, error) => {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error !!!';

    await logError('userController', error.stack || message);

    if (wantsHtml(req)) {
        return res.status(statusCode).send(renderVerificationPage({
            title: 'Verification failed',
            message: statusCode >= 500 ? 'We could not verify your email right now. Please try again later.' : message,
            status: 'error'
        }));
    }

    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? 'Internal server error !!!' : message
    });
};

module.exports = {
    verifyEmailSuccess,
    verifyEmailError
};
