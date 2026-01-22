# 🚀 Dynamic UI Logger

[![npm version](https://img.shields.io/npm/v/dynamic-ui-logger.svg)](https://www.npmjs.com/package/dynamic-ui-logger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A **lightweight, high-performance** React TypeScript library for logging UI interactions and events in your applications. Dynamic UI Logger uses **Web Workers** for non-blocking log processing and features **intelligent idle detection** for automatic log flushing.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔄 **Web Worker Processing** | Log processing happens in a separate thread, ensuring zero UI blocking |
| ⏰ **Idle Detection** | Automatically flushes logs after configurable periods of user inactivity |
| �️ **Global Error Capture** | Automatically captures unhandled errors and promise rejections |
| � **API Integration** | Seamlessly send logs to your backend with customizable headers |
| 📝 **TypeScript First** | Full TypeScript support with complete type definitions |
| ⚡ **Lightweight** | Minimal footprint with only essential dependencies |
| 🔧 **Configurable** | Extensive configuration options to fit your needs |
| 🧪 **Dev Mode Support** | Console logging in development, API logging in production |

---

## 📦 Installation

```bash
# Using npm
npm install dynamic-ui-logger

# Using yarn
yarn add dynamic-ui-logger

# Using pnpm
pnpm add dynamic-ui-logger
```

### Peer Dependencies

Ensure you have React 17 or 18 installed:

```bash
npm install react react-dom
```

---

## 🚀 Quick Start

### 1. Create a Logger Instance

First, create a custom logger configuration file:

```typescript
// logger.ts
import { useUILogger } from 'dynamic-ui-logger';

const getLogger = () => {
    return useUILogger({
        apiUrl: 'https://your-logging-api.com/logs',
        maxLogSize: 50,           // Buffer size before auto-flush
        idleTime: 30000,          // 30 seconds idle timeout
        sendDebugLogToApi: true,  // Enable debug log sending
        sendErrorLogToApi: true,  // Enable error log sending
    });
};

export default getLogger;
```

### 2. Use in Your Components

```tsx
// App.tsx
import React, { useState } from 'react';
import getLogger from './logger';

const App: React.FC = () => {
    const { log, error, flush } = getLogger();
    const [counter, setCounter] = useState(0);

    const handleClick = () => {
        setCounter(prev => prev + 1);
        log(`Button clicked - Counter: ${counter + 1}`);
    };

    const handleError = () => {
        try {
            throw new Error('Something went wrong!');
        } catch (err) {
            error(err as Error);
        }
    };

    return (
        <div>
            <button onClick={handleClick}>
                Click Me ({counter})
            </button>
            <button onClick={handleError}>
                Trigger Error
            </button>
            <button onClick={flush}>
                Flush Logs Now
            </button>
        </div>
    );
};

export default App;
```

---

## ⚙️ Configuration Options

The `useUILogger` hook accepts a configuration object with the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiUrl` | `string` | `''` | The endpoint URL where logs will be sent |
| `apiHeader` | `Record<string, string>` | `{}` | Custom headers to include with API requests |
| `maxLogSize` | `number` | `20` | Maximum number of logs to buffer before auto-flush |
| `idleTime` | `number` | `30000` | Milliseconds of user inactivity before auto-flush (default: 30s) |
| `sendDebugLogToApi` | `boolean` | `false` | Whether to send debug logs to the API on flush |
| `sendErrorLogToApi` | `boolean` | `false` | Whether to immediately send error logs to the API |
| `enableTimestamps` | `boolean` | `true` | Include timestamps in log entries |
| `autoCapture` | `boolean` | `false` | Enable automatic UI event capturing |

### Example Configuration

```typescript
const logger = useUILogger({
    apiUrl: 'https://api.yourservice.com/v1/logs',
    apiHeader: {
        'Authorization': 'Bearer your-api-token',
        'X-App-Version': '1.0.0',
    },
    maxLogSize: 100,
    idleTime: 60000,  // 1 minute
    sendDebugLogToApi: true,
    sendErrorLogToApi: true,
});
```

---

## 📖 API Reference

### `useUILogger(config: UILoggerConfig): UILoggerInstance`

Creates and returns a logger instance. The instance is a singleton - multiple calls return the same instance.

#### Returns: `UILoggerInstance`

| Method | Signature | Description |
|--------|-----------|-------------|
| `log` | `(message: string) => void` | Log a debug/info message |
| `error` | `(error: string \| Error) => void` | Log an error message or Error object |
| `flush` | `() => void` | Manually flush all buffered logs to the API |

---

## 🏗️ Architecture

### How It Works

```
┌────────────────────────────────────────────────────────────────┐
│                        Main Thread                              │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐  │
│  │ Your React   │───▶│   useUILogger   │───▶│  postMessage │  │
│  │ Components   │    │     Hook        │    │   to Worker  │  │
│  └──────────────┘    └─────────────────┘    └──────────────┘  │
│                              │                      │          │
│                              ▼                      │          │
│                    ┌─────────────────┐              │          │
│                    │  Idle Timer     │              │          │
│                    │  Detection      │              │          │
│                    └─────────────────┘              │          │
└─────────────────────────────────────────────────────│──────────┘
                                                      │
                                                      ▼
┌────────────────────────────────────────────────────────────────┐
│                       Web Worker Thread                         │
│  ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐  │
│  │  Log Buffer  │───▶│  Log Processing │───▶│  API Fetch   │  │
│  │  (In-Memory) │    │  & Formatting   │    │   Request    │  │
│  └──────────────┘    └─────────────────┘    └──────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Main Thread (`logger.ts`)**
   - Provides the `useUILogger` hook for React components
   - Integrates with `react-idle-timer` for activity detection
   - Registers global error handlers
   - Communicates with the Web Worker via `postMessage`

2. **Web Worker (`log.worker.ts`)**
   - Runs in a separate thread for non-blocking operation
   - Maintains an in-memory log buffer
   - Handles log batching and API submission
   - Supports different log types: `log`, `error`, and `flush`

3. **Idle Detection**
   - Uses `react-idle-timer` to detect user inactivity
   - Automatically flushes logs when the user becomes idle
   - Resets the timer on each new log entry

---

## 🔒 Global Error Handling

Dynamic UI Logger automatically captures:

- **Unhandled Errors**: JavaScript errors that bubble up to the window level
- **Unhandled Promise Rejections**: Promises that reject without a `.catch()` handler

```typescript
// Automatically captured!
throw new Error('Uncaught error');

// Also automatically captured!
Promise.reject('Unhandled rejection');
```

---

## 🔧 API Payload Format

When logs are flushed to your API, they are sent in the following format:

```json
{
    "header": {
        "action": "auditClientLogs",
        "corrId": "auditClientLogs-1705927385123",
        // ...your custom headers
    },
    "logs": "[\"Log message 1\", \"Log message 2\"]",
    "timestamp": 1705927385123
}
```

---

## 🌐 Development vs Production

Dynamic UI Logger automatically detects the environment:

| Environment | Behavior |
|-------------|----------|
| **Development** (`localhost`) | Logs are printed to console only, no API calls |
| **Production** | Logs are buffered and sent to the configured API endpoint |

---

## 📁 TypeScript Types

```typescript
// Configuration interface
export interface UILoggerConfig {
    maxLogSize?: number;           // Buffer size limit
    enableTimestamps?: boolean;    // Enable timestamps
    autoCapture?: boolean;         // Auto-capture UI events
    apiUrl?: string;               // API endpoint URL
    apiHeader?: Record<string, string>;  // Custom headers
    idleTime?: number;             // Idle timeout (ms)
    sendDebugLogToApi?: boolean;   // Send debug logs
    sendErrorLogToApi?: boolean;   // Send error logs
}

// Logger instance interface
export interface UILoggerInstance {
    log: (log: string) => void;
    error: (error: string | Error) => void;
    flush: () => void;
}

// Log entry structure
export interface UILogEntry {
    id: string;
    timestamp: number;
    type: 'click' | 'input' | 'navigation' | 'custom';
    target?: string;
    value?: string | number | boolean;
    metadata?: Record<string, any>;
}
```

---

## 🧪 Example Project

The repository includes a complete example application demonstrating all features:

```bash
# Clone the repository
git clone https://github.com/your-username/dynamic-ui-logger.git

# Navigate to the project
cd dynamic-ui-logger

# Install dependencies
npm install

# Run the development server
npm run dev
```

### Example Features Demonstrated

- ✅ Logging button clicks
- ✅ Logging input changes
- ✅ Logging navigation events
- ✅ Error handling (try/catch and custom errors)
- ✅ Manual log flushing
- ✅ Idle detection

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build the library for production |
| `npm run type-check` | Run TypeScript type checking |

---

## 📦 Publishing to npm

```bash
# Build the package
npm run build

# Login to npm (if not already logged in)
npm login

# Publish the package
npm publish
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Subhasis Bhattacharya**

---

## 🙏 Acknowledgments

- [react-idle-timer](https://github.com/supremetechnopriest/react-idle-timer) - For idle detection functionality
- [Vite](https://vitejs.dev/) - For the blazing fast build tool
- [TypeScript](https://www.typescriptlang.org/) - For type safety
