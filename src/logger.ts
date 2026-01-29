import { UILoggerConfig, UILoggerInstance, APILogEntry } from "./types";
import logWorker from "./workerInstance";
import { useIdleTimer } from "react-idle-timer";

let loggerInstance: UILoggerInstance | null = null;
let lastApiCall: APILogEntry | null = null;

let isIntercepted = false;

const interceptApiCalls = () => {
    if (isIntercepted) return;
    isIntercepted = true;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        const [resource, config] = args;
        const url = typeof resource === 'string' ? resource : (resource as Request).url;
        const method = (config?.method || (resource as Request).method || 'GET').toUpperCase();

        const entry: APILogEntry = {
            url,
            method,
            timestamp: Date.now(),
            payload: config?.body || (resource as Request).body,
        };

        lastApiCall = entry;

        try {
            const response = await originalFetch(...args);
            entry.status = response.status;
            // Note: We don't necessarily want to read the body as it might break the consumer
            // entry.response = await response.clone().json().catch(() => null);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null) {
        this._apiEntry = {
            url: url.toString(),
            method: method.toUpperCase(),
            timestamp: Date.now(),
        };
        return originalOpen.apply(this, [method, url, async, username, password] as any);
    };

    XMLHttpRequest.prototype.send = function (body?: any) {
        if (this._apiEntry) {
            this._apiEntry.payload = body;
            lastApiCall = this._apiEntry;
        }

        this.addEventListener('load', () => {
            if (this._apiEntry) {
                this._apiEntry.status = this.status;
            }
        });

        return originalSend.apply(this, [body]);
    };
};

// Extend XMLHttpRequest to store entry temporarily
declare global {
    interface XMLHttpRequest {
        _apiEntry?: APILogEntry;
    }
}


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
    const autoCaptureEvents = config.autoCaptureEvents || false;
    const autoCaptureAPI = config.autoCaptureAPI || false;
    const sessionId = `UILOGGER_${crypto.randomUUID()}`;

    const postMessage = (
        type: 'log' | 'error' | 'flush',
        message: string,
    ): void => {
        logWorker.postMessage({
            type,
            message,
            apiUrl,
            maxLogSize,
            isDev,
            header,
            sendDebugLogToApi,
            sendErrorLogToApi,
            sessionId
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
        const errorDetail = {
            error: typeof error === 'string' ? error : error.message,
            stack: typeof error === 'string' ? null : error.stack,
            lastApiCall: lastApiCall,
            timestamp: Date.now(),
        };
        postMessage('error', JSON.stringify(errorDetail));
    };

    const flush = (): void => {
        postMessage('flush', '');
    };


    const handleGlobalError = (event: ErrorEvent): void => {
        event.stopPropagation();
        error(new Error(`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`));
    };

    const handleGlobalUnhandledRejection = (event: PromiseRejectionEvent): void => {
        event.stopPropagation();
        error(new Error(`Unhandled Rejection: ${event.reason}`));
    };

    if (autoCaptureEvents) {
        window?.addEventListener('error', handleGlobalError);
        window?.addEventListener('unhandledrejection', handleGlobalUnhandledRejection);
    }

    if (autoCaptureAPI) {
        interceptApiCalls();
    }

    loggerInstance = {
        log,
        error,
        flush,
    };

    return loggerInstance;
}
