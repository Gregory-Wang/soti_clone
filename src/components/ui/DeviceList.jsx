import React, { useState, useEffect, useCallback, useRef } from 'react'
import apiService from '@/services/api.js';
import { useModal } from '@/components/ui/ModalManager.jsx';
import mqttService from '@/services/mqtt.js';
import timezoneService from '@/services/timezone.js';
import { useLanguage } from '@/hooks/useLanguage.js';

const DeviceList = ({ onRefresh, onDeviceSelect }) => {
    const { t } = useLanguage();
    const [devices, setDevices] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const { openModal } = useModal();
    
    // Use useRef to track whether the listener has been registered
    const isListenerRegistered = useRef(false);
    const heartbeatHandlerRef = useRef(null);

    // Load device data from database
    const loadDevices = useCallback(async () => {
        try {
            setError(null);
            
            // Get device list
            const devicesResponse = await apiService.getPrinters();
            const newDevices = devicesResponse.data || [];
            
            // Get statistics
            const statsResponse = await apiService.getPrinterStats();
            const newStats = statsResponse.data || {};
            
            // Update device list
            setDevices(newDevices);
            
            // Update statistics
            setStats(newStats);
            
            setLastUpdate(new Date());
            
        } catch (err) {
            console.error('Failed to load device data:', err);
            setError(t('loadingFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    // Create a stable heartbeat handler function
    const handleHeartbeatUpdate = useCallback((data) => {
        if (data.error) {
            console.error('Heartbeat update failed:', data.error);
            return;
        }
        
        // Immediately refresh device list
        loadDevices();
    }, [loadDevices]);

    // Register MQTT listener
    const registerMqttListener = useCallback(() => {
        if (isListenerRegistered.current) {
            return;
        }

        if (mqttService.isConnected) {
            mqttService.on('heartbeatUpdate', handleHeartbeatUpdate);
            isListenerRegistered.current = true;
            heartbeatHandlerRef.current = handleHeartbeatUpdate;
        } else {
            // If MQTT is not connected, wait for connection and then register
            const checkConnection = () => {
                if (mqttService.isConnected && !isListenerRegistered.current) {
                    mqttService.on('heartbeatUpdate', handleHeartbeatUpdate);
                    isListenerRegistered.current = true;
                    heartbeatHandlerRef.current = handleHeartbeatUpdate;
                } else if (!mqttService.isConnected) {
                    setTimeout(checkConnection, 1000);
                }
            };
            checkConnection();
        }
    }, [handleHeartbeatUpdate]);

    useEffect(() => {
        loadDevices();
        
        // Set up timed refresh, refresh data every 10 seconds (reduce frequency)
        const refreshInterval = setInterval(loadDevices, 10000);
        
        // Register MQTT listener
        registerMqttListener();
        
        return () => {
            clearInterval(refreshInterval);
            // Clean up MQTT listener
            if (isListenerRegistered.current && heartbeatHandlerRef.current) {
                mqttService.off('heartbeatUpdate', heartbeatHandlerRef.current);
                isListenerRegistered.current = false;
                heartbeatHandlerRef.current = null;
            }
        };
    }, []); // Remove loadDevices dependency to avoid duplicate registration

    // Expose refresh method to parent component
    useEffect(() => {
        if (onRefresh) {
            onRefresh(loadDevices);
        }
    }, [onRefresh, loadDevices]);

    const getStatusColor = (status) => {
        switch (status) {
            case 0: return 'status-online';
            case 1: return 'status-warning';
            case 2: return 'status-warning';
            case 3: return 'status-warning';
            case 100: return 'status-warning'; 
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = (status) => {
        // If there is a status code, display detailed status according to the status code
        if (status !== undefined) {
            switch (status) {
                case 0: return t('online');
                case 1: return t('unknownError');
                case 2: return t('printerOutOfPaper');
                case 3: return t('printerCoverOpen');
                case 4: return t('printerOverheated');
                case 5: return t('printerOutOfRibbon');
                default: return t('unknown');
            }
        }
        
        // Otherwise, display basic status according to the status
        switch (status) {
            case 0: return t('online');
            case 1: return t('unknownError');
            case 2: return t('printerOutOfPaper');
            case 3: return t('printerCoverOpen');
            case 4: return t('printerOverheated');
            case 5: return t('printerOutOfRibbon');
            default: return t('unknown');
        }
    };

    // Format time - use timezone service
    const formatDate = (dateString) => {
        return timezoneService.formatDateTime(dateString);
    };

    // Handle device click
    const handleDeviceClick = (device) => {
        if (onDeviceSelect) {
            onDeviceSelect(device);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">{t('deviceList')}</h3>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i className="fas fa-plus mr-2"></i>{t('addDevice')}
                        </button>
                    </div>
                </div>
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-500">{t('loadingDevices')}</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">{t('deviceList')}</h3>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            <i className="fas fa-plus mr-2"></i>{t('addDevice')}
                        </button>
                    </div>
                </div>
                <div className="p-8 text-center">
                    <div className="text-red-500 mb-4">
                        <i className="fas fa-exclamation-triangle text-2xl"></i>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button 
                        onClick={loadDevices}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <i className="fas fa-redo mr-2"></i>{t('retry')}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="p-1.5 bg-purple-100 rounded-lg">
                            <i className="fas fa-list text-purple-600 text-sm"></i>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">{t('deviceList')}</h3>
                            <p className="text-xs text-gray-500">{t('deviceManagement')}</p>
                        </div>
                    </div>
                    {lastUpdate && (
                        <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                            <i className="fas fa-clock mr-1"></i>
                            {timezoneService.formatTime(lastUpdate)}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="overflow-x-auto min-w-0">
                <table className="w-full min-w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('deviceName')}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('clientId')}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('firmwareVersion')}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('lastHeartbeat')}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('createdAt')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {devices.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                                    <div className="flex flex-col items-center">
                                        <i className="fas fa-print text-3xl text-gray-300 mb-2"></i>
                                        <p className="text-sm">{t('noDevices')}</p>
                                        <p className="text-xs text-gray-400">{t('clickAddDeviceToAddFirstPrinter')}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            devices.map(device => (
                                <tr 
                                    key={device.id} 
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleDeviceClick(device)}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center mr-2">
                                                <i className="fas fa-print text-purple-600 text-xs"></i>
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{device.name}</div>
                                                <div className="text-xs text-gray-500">ID: {device.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{device.client_id}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(device.status)}`}></div>
                                            <span className="text-sm text-gray-900">{getStatusText(device.status)}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {device.firmware_version || t('unknown')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {device.last_heartbeat ? formatDate(device.last_heartbeat) : t('neverConnected')}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(device.created_at)}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DeviceList