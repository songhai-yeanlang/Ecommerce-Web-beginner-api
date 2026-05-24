const { handleError } = require('../../shared/utils/handleError');
const userService = require('./user.service');
const userView = require('./user.view');

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
