import React, { useState, useEffect } from 'react';
import mqttService from '@/services/mqtt.js';

const MqttConnectionTest = () => {
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [listenerCount, setListenerCount] = useState(0);
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        const updateStatus = () => {
            setConnectionStatus(mqttService.isConnected ? 'connected' : 'disconnected');
            setLastUpdate(new Date());
            
            // Check event listener count
            if (mqttService.events && mqttService.events.heartbeatUpdate) {
                setListenerCount(mqttService.events.heartbeatUpdate.length);
            } else {
                setListenerCount(0);
            }
        };

        // Initial update
        updateStatus();

        // Periodically check status
        const interval = setInterval(updateStatus, 2000);

        return () => clearInterval(interval);
    }, []);

    const testConnection = async () => {
        try {
            await mqttService.connect();
        } catch (error) {
            console.error('MQTT connection test failed:', error);
        }
    };

    const testDisconnect = () => {
        try {
            mqttService.disconnect();
        } catch (error) {
            console.error('Failed to disconnect MQTT:', error);
        }
    };

    const clearListeners = () => {
        try {
            // Clear all heartbeat update listeners
            if (mqttService.events && mqttService.events.heartbeatUpdate) {
                mqttService.events.heartbeatUpdate = [];
            }
        } catch (error) {
            console.error('Failed to clear listeners:', error);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">MQTT Connection Test</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Connection Status</h3>
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                            connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className="text-sm font-medium">
                            {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                    {lastUpdate && (
                        <p className="text-xs text-gray-500 mt-1">
                            Last update: {lastUpdate.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Listener Status</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Heartbeat Update Listeners:</span>
                        <span className={`text-sm font-bold ${
                            listenerCount === 0 ? 'text-red-600' : 
                            listenerCount === 1 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                            {listenerCount} listener(s)
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {listenerCount === 0 ? 'No listeners' : 
                         listenerCount === 1 ? 'Normal' : 'Warning: Multiple listeners'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex space-x-2">
                    <button
                        onClick={testConnection}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Test Connection
                    </button>
                    <button
                        onClick={testDisconnect}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Disconnect
                    </button>
                    <button
                        onClick={clearListeners}
                        className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                        Clear Listeners
                    </button>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Instructions</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Connection Status</strong>: Shows whether MQTT service is connected</li>
                        <li>• <strong>Listener Status</strong>: Shows the number of heartbeat update event listeners</li>
                        <li>• <strong>Normal</strong>: There should be 1 listener</li>
                        <li>• <strong>Multiple listeners</strong>: Indicates duplicate registration issue</li>
                        <li>• <strong>No listeners</strong>: Indicates listener not registered correctly</li>
                    </ul>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• If you see multiple listeners, it means there is a duplicate registration issue</li>
                        <li>• Click "Clear Listeners" to remove all listeners</li>
                        <li>• Then refresh the page to let the system re-register listeners</li>
                        <li>• Check the console for duplicate registration messages</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default MqttConnectionTest; 