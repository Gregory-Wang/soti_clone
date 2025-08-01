import React from 'react';
import { logManager } from './MqttLogWindow.jsx';

const LogManagerTest = () => {
    const testLogManager = () => {
        try {
            // Test all log levels
            logManager.info('test', 'Test info message');
            logManager.warning('test', 'Test warning message');
            logManager.error('test', 'Test error message');
            logManager.success('test', 'Test success message');
            
            alert('logManager test completed successfully! Check the console and log window.');
        } catch (error) {
            console.error('logManager test failed:', error);
            alert(`logManager test failed: ${error.message}`);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">LogManager Test</h2>
            <p className="text-gray-600 mb-4">
                Click the button below to test if logManager works properly.
            </p>
            <button
                onClick={testLogManager}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Test LogManager
            </button>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Test Instructions:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Four test logs will be generated after clicking the button</li>
                    <li>• Check if there are any errors in the console</li>
                    <li>• Check if the test logs are displayed in the log window at the bottom right</li>
                    <li>• If you see the test logs, logManager is working properly</li>
                </ul>
            </div>
        </div>
    );
};

export default LogManagerTest; 