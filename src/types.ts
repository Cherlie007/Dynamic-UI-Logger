export interface UILogEntry {
    id: string;
    timestamp: number;
    type: 'click' | 'input' | 'navigation' | 'custom';
    target?: string;
    value?: string | number | boolean;
    metadata?: Record<string, any>;
}

export interface UILoggerConfig {
    maxLogSize?: number;
    enableTimestamps?: boolean;
    autoCapture?: boolean;
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