const { writeErrorLog } = require('../../shared/utils/handleError');

const userMiddleware = (schema) => async (req, res, next) => {
    // Joi uses .validate(), not .userValidate()
    const { error, value } = schema.validate(req.body, {
        abortEarly: false
    });
    if (error) {
        await writeErrorLog('userController', error);

        return res.status(400).json({
            success: false,
            message: 'invalid field',
            details: error.details.map((d) => d.message)
        });
    } else {
        req.validated = value;
        next();
    }
}
module.exports = {
    userMiddleware
};
