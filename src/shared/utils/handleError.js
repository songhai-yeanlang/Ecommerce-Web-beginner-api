const { logError } = require('./logError');

const getErrorResponse = (error) => {
    if (error.code === 'ER_DUP_ENTRY') {
        return {
            statusCode: 409,
            message: 'Email already exists'
        };
    }

    const statusCode = error.statusCode || error.status || 500;
    const message = error.message || 'Internal server error !!!';

    return {
        statusCode,
        message: statusCode >= 500 ? 'Internal server error !!!' : message
    };
};

const writeErrorLog = async (controller, error) => {
    // Safely parse the error even if it is not a standard Error object (e.g. an array or custom object)
    let message = 'Unknown error';
    
    if (error?.stack) {
        // Make the stack trace cleaner by removing node_modules and internal Node.js lines
        message = error.stack
            .split('\n')
            .filter(line => !line.includes('node_modules') && !line.includes('node:internal'))
            .join('\n');
    } else {
        message = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    }

    // Print the error to the terminal during development
    console.error(`[${controller}] Error:`, error);
    
    await logError(controller, message);
};

const handleError = async (res, controller, error) => {
    const { statusCode, message } = getErrorResponse(error);

    await writeErrorLog(controller, error);

    return res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = {
    getErrorResponse,
    handleError,
    writeErrorLog
};
