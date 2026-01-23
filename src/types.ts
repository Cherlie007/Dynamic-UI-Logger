
export interface APILogEntry {
    url: string;
    method: string;
    status?: number;
    timestamp: number;
    payload?: any;
    response?: any;
}

export interface UILoggerConfig {
    maxLogSize?: number;
    enableTimestamps?: boolean;
    autoCaptureEvents?: boolean;
    autoCaptureAPI?: boolean;
    apiUrl?: string;
    apiHeader?: Record<string, string>;
    idleTime?: number;
    sendDebugLogToApi?: boolean;
    sendErrorLogToApi?: boolean;
}


export interface UILoggerInstance {
    log: (log: string) => void;
    error: (error: string | Error) => void;
    flush: () => void;
}