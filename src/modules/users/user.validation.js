const joi = require('joi');

const registerUserSchema = joi.object({
    name: joi.string().min(3),
    username: joi.string().min(3),
    email: joi.string().email().required(),
    password: joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
        .required()
        .messages({
            'string.min': 'password must be at least 8 characters',
            'string.max': 'password must be at most 30 characters',
            'string.pattern.base': 'password must include uppercase, lowercase, number, and special character',
            'any.required': 'password is required'
        })
}).xor('name', 'username');


const resendVerificationSchema = joi.object({
    email: joi.string().email().required()
});

const loginUserSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
});

const changePasswordSchema = joi.object({
    oldPassword: joi.string().required(),
    newPassword: joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
        .required()
        .messages({
            'string.min': 'new password must be at least 8 characters',
            'string.max': 'new password must be at most 30 characters',
            'string.pattern.base': 'new password must include uppercase, lowercase, number, and special character',
            'any.required': 'new password is required'
        })
});

const forgotPasswordSchema = joi.object({
    email: joi.string().email().required()
});

const resetPasswordSchema = joi.object({
    email: joi.string().email().required(),
    otp: joi.string().length(6).required(),
    newPassword: joi.string()
        .min(8)
        .max(30)
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])'))
        .required()
        .messages({
            'string.min': 'new password must be at least 8 characters',
            'string.max': 'new password must be at most 30 characters',
            'string.pattern.base': 'new password must include uppercase, lowercase, number, and special character',
            'any.required': 'new password is required'
        })
});

module.exports = {
    registerUserSchema,
    resendVerificationSchema,
    loginUserSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema
};
