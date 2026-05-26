const express = require('express');
const userController = require('./user.controller');
const { userMiddleware, isLogin } = require('./user.middleware');
const { registerUserSchema, resendVerificationSchema, loginUserSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } = require('./user.validation');

const router = express.Router();

router.post('/register', userMiddleware(registerUserSchema), userController.register);
router.get('/verify-email', userController.verifyEmail);
router.post('/resend-verification', userMiddleware(resendVerificationSchema), userController.resendVerification);
router.post('/login', userMiddleware(loginUserSchema), userController.login);
router.get('/profile', isLogin, userController.getProfile);
router.post('/change-pass', isLogin, userMiddleware(changePasswordSchema), userController.changePassword);
router.delete('/delete-profile', isLogin, userController.deleteProfile);
router.put('/update-profile', isLogin, userController.updateProfile);
router.post('/forgot-password', userMiddleware(forgotPasswordSchema), userController.forgotPassword);
router.post('/reset-password', userMiddleware(resetPasswordSchema), userController.resetPassword);

module.exports = router;
