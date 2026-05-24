const fs = require("fs/promises");
const path = require("path");
const moment = require('moment');

const logError = async (controller, message_err) => {
    try {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        // Go up 3 directory levels (utils -> shared -> src -> project root)
        const logPath = path.join(__dirname, "..", "..", "..", "logs", `${controller}.txt`);
        const logMessage = `[${timestamp}] ${message_err}\n`;
        await fs.mkdir(path.dirname(logPath), { recursive: true });
        await fs.appendFile(logPath, logMessage);

    } catch (error) {
        console.log('Error writing to log file: ', error);
    }
}


module.exports = {
    logError
};
