const { handleError } = require('../../shared/utils/handleError');
const userService = require('./user.service');
const userView = require('./user.view');

const register = async (req, res) => {
    try {

        let row = await userService.register(req.validated || req.body);
        const message = row.emailSent
            ? "User registered successfully. Please check your email to verify your account."
            : "User registered successfully, but we couldn't send the verification email right now. Please try requesting a new verification link later.";

        return res.status(201).json({
            success: true,
            message,
            data: row
        });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
}

const verifyEmail = async (req, res) => {
    try {
        const row = await userService.verifyEmail(req.query.token);
        return userView.verifyEmailSuccess(req, res, row);
    } catch (error) {
        return await userView.verifyEmailError(req, res, error);
    }
};

const resendVerification = async (req, res) => {
    try {
        const { email } = req.validated;
        const result = await userService.resendVerification(email);

        const message = result.emailSent
            ? "Verification email resent successfully. Please check your inbox."
            : "We encountered an issue sending the email. Please try again later.";

        return res.status(200).json({ success: true, message });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
};

const login = async (req, res) => {
    try {
        let row = await userService.login(req.validated);
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: row
        });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
}

const getProfile = async (req, res) => {
    try {
        const userProfile = await userService.getProfile(req.user.id);
        return res.status(200).json({
            success: true,
            message: "User profile retrieved successfully",
            data: userProfile
        });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
};

const changePassword = async (req, res) => {
    try {
        await userService.changePassword(req.user.id, req.validated);
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
};

const deleteProfile = async (req, res) => {
    try {
        await userService.deleteProfile(req.user.id);
        return res.status(200).json({
            success: true,
            message: "Profile deleted successfully"
        });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
};

const updateProfile = async (req, res) => {
    try {
        await userService.updateProfile(req.user.id, req.body);
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
        });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.validated;
        const result = await userService.forgotPassword(email);

        const message = result.emailSent
            ? "Password reset OTP sent successfully. Please check your email."
            : "We encountered an issue sending the email. Please try again later.";

        return res.status(200).json({ success: true, message });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
};

const resetPassword = async (req, res) => {
    try {
        await userService.resetPassword(req.validated);
        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login with your new password."
        });
    } catch (error) {
        return await handleError(res, 'userController', error);
    }
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
