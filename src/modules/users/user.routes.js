const express = require('express');
const userController = require('./user.controller');
const { userMiddleware } = require('./user.middleware');
const { registerUserSchema } = require('./user.validation');

const router = express.Router();


router.post('/register', userMiddleware(registerUserSchema), userController.register);
router.get('/verify-email', userController.verifyEmail);

module.exports = router;
