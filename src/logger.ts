import { UILoggerConfig, UILoggerInstance } from "./types";
import logWorker from "./workerInstance";
import { useIdleTimer } from "react-idle-timer";

let loggerInstance: UILoggerInstance | null = null;

export const useUILogger = (config: UILoggerConfig) => {
    if (loggerInstance) {
        return loggerInstance;
    }

    const idleTime = config.idleTime || 30000;
    const apiUrl = config.apiUrl || '';
    const maxLogSize = config.maxLogSize || 20;
    const isDev = window?.location?.hostname?.includes('localhost') || false;
    const sendDebugLogToApi = config.sendDebugLogToApi || false;
    const sendErrorLogToApi = config.sendErrorLogToApi || false;
    const header = config.apiHeader || {};

    const postMessage = (
        type: 'log' | 'error' | 'flush',
        message: string,
    ) : void => {
        logWorker.postMessage({ 
            type,
            message,
            apiUrl,
            maxLogSize,
            isDev,
            header,
            sendDebugLogToApi,
            sendErrorLogToApi,
        });
    };

    const { reset } = useIdleTimer({
        timeout: idleTime,
        onIdle: () => postMessage('flush', ''),
        debounce: 500,
    });

    const log = (message: string): void => {
        postMessage('log', message);
        reset();
    };

    const error = (error: string | Error): void => {
        console.log("error", error);
        postMessage('error', JSON.stringify(error));
    };

    const flush = (): void => {
        postMessage('flush', '');
    };


    const handleGlobalError = (event: ErrorEvent): void => {
        event.stopPropagation();
        error(`Error: ${event.message} at ${event.filename}:${event.lineno}:${event.colno}`);
    };

    const handleGlobalUnhandledRejection = (event: PromiseRejectionEvent): void => {
        event.stopPropagation();
        error(`Unhandled Rejection: ${event.reason}`);
    };

    window?.addEventListener('error', handleGlobalError);
    window?.addEventListener('unhandledrejection', handleGlobalUnhandledRejection);


    loggerInstance = {
        log,
        error,
        flush,
    };

    return loggerInstance;
}