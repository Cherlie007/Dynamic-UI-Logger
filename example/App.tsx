import React, { useState } from 'react';
import getLogger from './customLogger';

const App: React.FC = () => {
    const {log, error, flush} = getLogger();
    const [inputValue, setInputValue] = useState('');
    const [counter, setCounter] = useState(0);

    // Example: Log button clicks
    const handleButtonClick = () => {
        setCounter(prev => prev + 1);
        log(`Button clicked - Counter is now: ${counter + 1}`);
    };

    // Example: Log input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        log(`Input changed: "${value}"`);
    };

    // Example: Log navigation events
    const handleNavigate = (page: string) => {
        log(`User navigated to: ${page}`);
    };

    // Example: Log an error
    const handleTriggerError = () => {
        try {
            throw new Error('This is a test error!');
        } catch (err) {
            error(err as Error);
        }
    };

    // Example: Log a custom error message
    const handleLogCustomError = () => {
        error('Custom error message: Something went wrong!');
    };

    // Example: Simulate null error with proper null checking
    const handleSimulateNullError = () => {
        try {
            // Simulate accessing property on null object
            const nullObject: any = null;
            // Add null check before accessing property
            if (nullObject && nullObject.name) {
                console.log(nullObject.name);
            } else {
                throw new Error('Attempted to access property "name" on null object');
            }
        } catch (err) {
            error(err as Error);
        }
    };

    // Example: Manually flush logs
    const handleFlushLogs = () => {
        flush();
        console.log('Logs flushed manually!');
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>Dynamic UI Logger - Example</h1>

            <section style={{ marginBottom: '20px' }}>
                <h2>Log Button Clicks</h2>
                <button onClick={handleButtonClick}>
                    Click Me (Count: {counter})
                </button>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2>Log Input Changes</h2>
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder="Type something..."
                    style={{ padding: '8px', width: '250px' }}
                />
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2>Log Navigation Events</h2>
                <button onClick={() => handleNavigate('/home')} style={{ marginRight: '10px' }}>
                    Go to Home
                </button>
                <button onClick={() => handleNavigate('/dashboard')} style={{ marginRight: '10px' }}>
                    Go to Dashboard
                </button>
                <button onClick={() => handleNavigate('/settings')}>
                    Go to Settings
                </button>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2>Error Logging</h2>
                <button onClick={handleTriggerError} style={{ marginRight: '10px' }}>
                    Trigger Error (try/catch)
                </button>
                <button onClick={handleLogCustomError}>
                    Log Custom Error
                </button>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2>Null Error Simulation</h2>
                <button onClick={handleSimulateNullError} style={{ marginRight: '10px' }}>
                    Simulate Null Error (Fixed)
                </button>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2>Manual Log Flush</h2>
                <p style={{ color: '#666' }}>
                    Logs are automatically flushed when idle time is reached or when the log buffer is full.
                    You can also flush manually:
                </p>
                <button onClick={handleFlushLogs}>
                    Flush Logs Now
                </button>
            </section>

            <section style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
                <h2>How it works</h2>
                <ul>
                    <li><strong>Automatic Logging:</strong> Logs are buffered and sent to the API in batches</li>
                    <li><strong>Idle Detection:</strong> Logs are automatically flushed after {30000 / 1000} seconds of inactivity</li>
                    <li><strong>Error Capture:</strong> Global errors and unhandled rejections are automatically captured</li>
                    <li><strong>Web Worker:</strong> Log processing happens in a separate thread to avoid blocking UI</li>
                </ul>
            </section>
        </div>
    );
};

export default App;