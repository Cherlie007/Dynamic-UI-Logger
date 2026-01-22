import { useUILogger } from '../src/logger';

interface UILoggerInstance {
    log: (log: string) => void;
    error: (error: string | Error) => void;
    flush: () => void;
}

const getLogger = () => {
    let logger: UILoggerInstance | null = null;
    if(!logger) {
    // Initialize the UI Logger with configuration
        logger = useUILogger({
            apiUrl: 'https://your-logging-api.com/logs',
            apiHeader: {},
            maxLogSize: 50,           // Flush logs when buffer reaches 50 entries
            idleTime: 30000,          // Auto-flush after 30 seconds of inactivity
            sendDebugLogToApi: true,  // Send debug logs to API
            sendErrorLogToApi: true,  // Send error logs to API
        });
    }
    return logger;
}

export default getLogger;
