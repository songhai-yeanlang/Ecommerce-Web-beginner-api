const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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
    const email = data.email.toLowerCase();
    const hashPassword = await bcrypt.hash(data.password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);

    const row = await userModel.register({
        name,
        email,
        password: hashPassword,
        verificationToken,
        verificationExpires,
        isVerified: false,
        isActive: false
    });

    const verificationUrl = createVerificationUrl(verificationToken);
    let emailSent = true;

    try {
        await userMailer.sendVerificationEmail({
            to: email,
            name,
            verificationUrl
        });
    } catch (error) {
        console.error(`[user.service] Failed to send verification email to ${email}:`, error.message);
        emailSent = false;
    }

    return {
        id: row.insertId,
        name,
        email,
        isVerified: false,
        isActive: false,
        emailSent
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

const resendVerification = async (email) => {
    const user = await userModel.findByEmail(email.toLowerCase());

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    if (user.is_verified) {
        const error = new Error('Email is already verified');
        error.statusCode = 400;
        throw error;
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + VERIFICATION_EXPIRES_HOURS * 60 * 60 * 1000);

    await userModel.updateVerificationToken(user.id, verificationToken, verificationExpires);

    const verificationUrl = createVerificationUrl(verificationToken);
    let emailSent = true;

    try {
        await userMailer.sendVerificationEmail({
            to: user.email,
            name: user.name,
            verificationUrl
        });
    } catch (error) {
        console.error(`[user.service] Failed to resend verification email to ${user.email}:`, error.message);
        emailSent = false;
    }

    return { emailSent };
};

const login = async (data) => {
    const { email, password } = data;
    const user = await userModel.findForLogin(email.toLowerCase());

    if (!user) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const error = new Error('Invalid email or password');
        error.statusCode = 401;
        throw error;
    }

    if (!user.is_verified) {
        const error = new Error('Please verify your email before logging in');
        error.statusCode = 403;
        throw error;
    }


    if (!user.is_active) {
        const error = new Error('Your account has been deactivated');
        error.statusCode = 403;
        throw error;
    }


    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_fallback_secret_key', {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });


    return {
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        },
        token
    };
};

const getProfile = async (id) => {
    const user = await userModel.findById(id);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    return user;
};

const changePassword = async (userId, data) => {
    const { oldPassword, newPassword } = data;

    const user = await userModel.findPasswordById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
        const error = new Error('Invalid old password');
        error.statusCode = 400;
        throw error;
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, hashPassword);
};

const deleteProfile = async (userId) => {
    const user = await userModel.findById(userId);

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    await userModel.deleteProfile(userId);
};

const updateProfile = async (userId, data) => {
    let user = await userModel.findById(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }
    let row = await userModel.updateProfile({
        id: userId,
        name: data.name !== undefined ? data.name : user.name,
        phone: data.phone !== undefined ? data.phone : user.phone,
        address: data.address !== undefined ? data.address : user.address,
        bio: data.bio !== undefined ? data.bio : user.bio,
    });
    return row;

}

const forgotPassword = async (email) => {
    const user = await userModel.findByEmail(email.toLowerCase());

    if (!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const tokenData = JSON.stringify({
        otp,
        expires: Date.now() + 3600000 // 1 hour
    });

    await userModel.updateToken(user.id, tokenData);

    let emailSent = true;

    try {
        await userMailer.sendResetPasswordEmail({
            to: user.email,
            name: user.name,
            otp
        });
    } catch (error) {
        console.error(`[user.service] Failed to send reset password email to ${user.email}:`, error.message);
        emailSent = false;
    }

    return { emailSent };
};

const resetPassword = async (data) => {
    const { email, otp, newPassword } = data;
    const user = await userModel.findByEmail(email.toLowerCase());

    if (!user) {
        const error = new Error('Invalid email or OTP');
        error.statusCode = 400;
        throw error;
    }

    const tokenRow = await userModel.findTokenById(user.id);
    if (!tokenRow || !tokenRow.token) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 400;
        throw error;
    }

    let tokenData;
    try {
        tokenData = JSON.parse(tokenRow.token);
    } catch (e) {
        const error = new Error('Invalid or expired OTP');
        error.statusCode = 400;
        throw error;
    }

    if (tokenData.otp !== otp) {
        const error = new Error('Invalid OTP');
        error.statusCode = 400;
        throw error;
    }

    if (Date.now() > tokenData.expires) {
        const error = new Error('OTP has expired');
        error.statusCode = 400;
        throw error;
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(user.id, hashPassword);
    await userModel.updateToken(user.id, null);
};

module.exports = {
    register,
    verifyEmail,
    resendVerification,
    login,
    getProfile,
    changePassword,
    deleteProfile,
    updateProfile,
    forgotPassword,
    resetPassword
};
