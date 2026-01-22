
export default (): void => {

    let logs: string[] = [];

    const sendLogsToApi = (apiUrl: string, header: Record<string, string>): void => {
        if (logs.length > 0) {
            const defaultHeaders = {
                action: "auditClientLogs",
                corrId: `auditClientLogs-${Date.now()}`,
            }
            const payload = {
                header: header && Object.keys(header).length > 0 ? header : defaultHeaders,
                logs: JSON.stringify(logs),
                timestamp: Date.now(),
            }
            fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
                .catch((error) => {
                    console.error('Error:', error);
                });

            // clear logs after sending to api
            logs = [];
        }
    }

    self.onmessage = (event: MessageEvent) => {
        const {
            type,
            message,
            apiUrl,
            maxLogSize,
            isDev,
            header,
            sendDebugLogToApi,
            sendErrorLogToApi,
        } = event.data;

        if (isDev) {
            console.log(message);
            return;
        }
        
        switch (type) {
            case 'log':
                if (logs.length >= maxLogSize) {
                    logs.shift();
                }
                logs.push(message);
                break;
            case 'error':
                logs.push(message);
                if (sendErrorLogToApi) {
                    sendLogsToApi(apiUrl, header);
                }
                break;
            case 'flush':
                if(sendDebugLogToApi) {
                    sendLogsToApi(apiUrl, header);
                }
                break;
            default:
                break;
        }
    }
}