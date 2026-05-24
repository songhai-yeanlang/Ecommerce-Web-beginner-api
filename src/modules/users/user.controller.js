const { logError } = require('../../shared/utils/logError');
const userService = require('./user.service');
const userView = require('./user.view');

const handleError = async (res, controller, error) => {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'Email already exists'
        });
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error !!!";

    await logError(controller, error.stack || message);

    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? "Internal server error !!!" : message
    });
};

const register = async (req, res) => {
    try {

        let row = await userService.register(req.validated || req.body);
        return res.status(200).json({
            success: true,
            message: "User registered successfully. Please check your email to verify your account.",
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

module.exports = {
    register,
    verifyEmail
};
