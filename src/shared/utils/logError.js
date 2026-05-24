const fs = require("fs/promises");
const path = require("path");

const logError = async (controller, message_err) => {
    try {
        const now = new Date();
        // Formats to 'YYYY-MM-DD HH:mm:ss' naturally
        const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
        const dateString = timestamp.split(' ')[0]; // Gets just 'YYYY-MM-DD'
        
        // Create daily log files to prevent infinite file size growth
        const logPath = path.join(__dirname, "..", "logs", `${controller}-${dateString}.txt`);
        
        // Add a line break and visual separator for easier reading of multi-line stack traces
        const logMessage = `[${timestamp}]\n${message_err}\n------------------------------------------------------------\n`;
        await fs.mkdir(path.dirname(logPath), { recursive: true });
        await fs.appendFile(logPath, logMessage);

    } catch (error) {
        console.error('Error writing to log file: ', error);
    }
}


module.exports = {
    logError
};
