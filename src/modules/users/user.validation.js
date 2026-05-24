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



module.exports = {
    registerUserSchema,
};
