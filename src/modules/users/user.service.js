const bcrypt = require('bcrypt');
const crypto = require('crypto');
const userMailer = require('./user.mailer');
const userModel = require('./user.model');

const VERIFICATION_EXPIRES_HOURS = 24;

const createVerificationUrl = (verificationToken) => {
    const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const verificationUrl = new URL('/api/users/verify-email', baseUrl);
    verificationUrl.searchParams.set('token', verificationToken);

    return verificationUrl.toString();
};

const register = async (data) => {
    const name = data.name || data.username;
    const hashPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);

    const row = await userModel.register({
        name,
        email: data.email,
        password: hashPassword,
        verificationToken,
        verificationExpires,
        isVerified: false,
        isActive: false
    });

    const verificationUrl = createVerificationUrl(verificationToken);
    await userMailer.sendVerificationEmail({
        to: data.email,
        name,
        verificationUrl
    });

    return {
        id: row.insertId,
        name,
        email: data.email,
        isVerified: false,
        isActive: false
    };
};

const verifyEmail = async (verificationToken) => {
    if (!verificationToken) {
        const error = new Error('Verification token is required');
        error.statusCode = 400;
        throw error;
    }

    const user = await userModel.findByVerificationToken(verificationToken);

    if (!user) {
        const error = new Error('Invalid verification link');
        error.statusCode = 400;
        throw error;
    }

    if (new Date(user.verification_expires).getTime() < Date.now()) {
        const error = new Error('Verification link has expired');
        error.statusCode = 400;
        throw error;
    }

    await userModel.markEmailAsVerified(user.id);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: true,
        isActive: true
    };
};

module.exports = {
    register,
    verifyEmail
};
