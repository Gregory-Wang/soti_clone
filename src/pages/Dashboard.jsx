import React, { useState, useEffect } from 'react';
import StatCard from '@/components/ui/StatCard';
import DeviceStatusChart from '@/components/ui/DeviceStatusChart';
import PerformanceChart from '@/components/ui/PerformanceChart';
import DeviceList from '@/components/ui/DeviceList';
import { ModalTrigger } from '@/components/ui/ModalManager.jsx';
import apiService from '@/services/api.js';
import mqttService from '@/services/mqtt.js';
import timezoneService from '@/services/timezone.js';
import { useLanguage } from '@/hooks/useLanguage.js';

const Dashboard = ({ onNavigateToSettings }) => {
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        total: 0,
        online: 0,
        offline: 0,
        warning: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mqttConnected, setMqttConnected] = useState(false);
    const [showTransition, setShowTransition] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Load statistics from database
    // Use functional update to avoid state reset flicker
    // Update last update time
    const loadStats = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true);
            }
            setError(null);
            
            const response = await apiService.getPrinterStats();
            const newStats = response.data || {
                total: 0,
                online: 0,
                offline: 0,
                warning: 0
            };
            
            // Use functional update to avoid state reset flicker
            setStats(prevStats => ({
                ...prevStats,
                ...newStats
            }));
            
            // Update last update time
            setLastUpdate(new Date());
            
        } catch (err) {
            console.error('Failed to load statistics:', err);
            setError(t('loadingFailed'));
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    // Check MQTT connection status
    const checkMqttConnection = () => {
        setMqttConnected(mqttService.isConnected);
    };

    // Listen for MQTT connection status changes
    useEffect(() => {
        const handleConnectionStatusChange = (data) => {
            setMqttConnected(data.status === 'connected');
        };

        // Initial check
        checkMqttConnection();

        // Register event listener
        mqttService.on('connectionStatusChanged', handleConnectionStatusChange);

        return () => {
            mqttService.off('connectionStatusChanged', handleConnectionStatusChange);
        };
    }, []);

    // Listen for printer add events
    useEffect(() => {
        const handlePrinterAdded = () => {
            // Show transition effect
            setShowTransition(true);
            
            // Delay reload statistics to let user see transition
            setTimeout(() => {
                loadStats(false); // Do not show loading state
                setShowTransition(false);
            }, 1000);
        };

        // Register printer add event listener
        mqttService.on('printerAdded', handlePrinterAdded);

        return () => {
            mqttService.off('printerAdded', handlePrinterAdded);
        };
    }, []); // Remove loadStats dependency to avoid infinite loop

    // Listen for printer status change events
    useEffect(() => {
        let updateTimeout;
        
        const handleHeartbeatUpdate = () => {
            // Debounce: delay 500ms to update, avoid frequent refresh
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                loadStats(false); // Do not show loading state
            }, 500);
        };

        // Register heartbeat update event listener
        mqttService.on('heartbeatUpdate', handleHeartbeatUpdate);

        return () => {
            mqttService.off('heartbeatUpdate', handleHeartbeatUpdate);
            clearTimeout(updateTimeout);
        };
    }, []); // Remove loadStats dependency to avoid infinite loop

    // Initial load and periodic refresh
    useEffect(() => {
        loadStats(true); // Initial load shows loading state
        
        // Refresh statistics every 15 seconds to ensure timely update
        const refreshInterval = setInterval(() => {
            loadStats(false); // Periodic refresh does not show loading state
        }, 15000);
        
        return () => {
            clearInterval(refreshInterval);
        };
    }, []);

    // Calculate change percentage (here use mock data, in real project can calculate from history)
    const calculateChange = (current, previous = 0) => {
        if (previous === 0) return current > 0 ? '+100%' : '0%';
        const change = ((current - previous) / previous) * 100;
        return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
    };

    // Loading state
    if (loading) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-500">{t('loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center py-12">
                        <div className="text-red-500 mb-4">
                            <i className="fas fa-exclamation-triangle text-4xl"></i>
                        </div>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button 
                            onClick={loadStats}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <i className="fas fa-redo mr-2"></i>{t('retry')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Check if there are printers
    const hasPrinters = stats.total > 0;

    // Render setup guide interface
    const renderSetupGuide = () => {
        return (
            <div className="space-y-6">
                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('setupGuideTitle')}</h1>
                    <p className="text-gray-600">{t('setupGuideDescription')}</p>
                </div>

                {/* Step 1: MQTT connection status */}
                <div className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ${
                    !mqttConnected ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
                }`}>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                                !mqttConnected ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                                <i className={`fas ${!mqttConnected ? 'fa-wifi' : 'fa-check'} text-lg`}></i>
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${
                                    !mqttConnected ? 'text-blue-800' : 'text-green-800'
                                }`}>
                                    {!mqttConnected ? t('mqttNotConnectedTitle') : t('mqttConnectedTitle')}
                                </h3>
                                <p className={`text-sm ${
                                    !mqttConnected ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                    {!mqttConnected ? t('mqttNotConnectedDescription') : t('mqttConnectedDescription')}
                                </p>
                            </div>
                        </div>
                        
                        {!mqttConnected && (
                            <button 
                                onClick={onNavigateToSettings}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                                <i className="fas fa-cog mr-2"></i>
                                {t('configureMqttSettings')}
                            </button>
                        )}
                    </div>
                </div>

                {/* Connection line */}
                {mqttConnected && (
                    <div className="flex justify-center">
                        <div className="w-0.5 h-8 bg-green-300"></div>
                    </div>
                )}

                {/* Step 2: Add printer */}
                <div className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ${
                    !mqttConnected ? 'opacity-50' : !hasPrinters ? 'border-blue-200 bg-blue-50' : 'border-green-200 bg-green-50'
                }`}>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                                !mqttConnected ? 'bg-gray-100 text-gray-400' : 
                                !hasPrinters ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                                <i className={`fas ${!mqttConnected ? 'fa-lock' : !hasPrinters ? 'fa-print' : 'fa-check'} text-lg`}></i>
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${
                                    !mqttConnected ? 'text-gray-500' : 
                                    !hasPrinters ? 'text-blue-800' : 'text-green-800'
                                }`}>
                                    {!mqttConnected ? t('addPrinterLockedTitle') : 
                                     !hasPrinters ? t('noPrintersTitle') : t('printersAddedTitle')}
                                </h3>
                                <p className={`text-sm ${
                                    !mqttConnected ? 'text-gray-400' : 
                                    !hasPrinters ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                    {!mqttConnected ? t('addPrinterLockedDescription') : 
                                     !hasPrinters ? t('noPrintersDescription') : t('printersAddedDescription')}
                                </p>
                            </div>
                        </div>
                        
                        {mqttConnected && !hasPrinters && (
                            <ModalTrigger modalType="addPrinter">
                                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                                    <i className="fas fa-plus mr-2"></i>
                                    {t('addFirstPrinter')}
                                </button>
                            </ModalTrigger>
                        )}
                    </div>
                </div>

                {/* Connection line */}
                {mqttConnected && hasPrinters && (
                    <div className="flex justify-center">
                        <div className="w-0.5 h-8 bg-green-300"></div>
                    </div>
                )}

                {/* Step 3: System ready */}
                <div className={`bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-300 ${
                    !mqttConnected || !hasPrinters ? 'opacity-50' : 'border-green-200 bg-green-50'
                }`}>
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                                !mqttConnected || !hasPrinters ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'
                            }`}>
                                <i className={`fas ${!mqttConnected || !hasPrinters ? 'fa-lock' : 'fa-check'} text-lg`}></i>
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${
                                    !mqttConnected || !hasPrinters ? 'text-gray-500' : 'text-green-800'
                                }`}>
                                    {!mqttConnected || !hasPrinters ? t('systemReadyLockedTitle') : t('systemReadyTitle')}
                                </h3>
                                <p className={`text-sm ${
                                    !mqttConnected || !hasPrinters ? 'text-gray-400' : 'text-green-600'
                                }`}>
                                    {!mqttConnected || !hasPrinters ? t('systemReadyLockedDescription') : t('systemReadyDescription')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Transition effect
    if (showTransition) {
        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="text-center py-12">
                        <div className="mb-6">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <h2 className="text-xl font-bold text-gray-700 mb-2">{t('printerAddedTransitionTitle')}</h2>
                            <p className="text-gray-500">{t('printerAddedTransitionDescription')}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If system is not fully ready, show setup guide
    if (!mqttConnected || !hasPrinters) {
        return renderSetupGuide();
    }

    return (
        <div className="space-y-4 transition-opacity duration-300">
            {/* Last update time */}
            {lastUpdate && (
                <div className="flex justify-end mb-2">
                    <div className="text-xs text-gray-500 flex items-center bg-gray-100 px-2 py-1 rounded">
                        <i className="fas fa-clock mr-1"></i>
                        {t('lastUpdate')}: {timezoneService.formatTime(lastUpdate)}
                    </div>
                </div>
            )}
            
            {/* Statistic cards and device status chart - displayed side by side */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Left: four statistic cards - 2x2 layout, fill height */}
                <div className="xl:col-span-2 h-full">
                    <div className="grid grid-cols-2 gap-4 h-full">
                        <StatCard
                            title={t('totalDevices')}
                            value={stats.total}
                            icon="fas fa-desktop"
                            color="bg-blue-500"
                            change={calculateChange(stats.total, stats.total - 1)}
                            changeType="increase"
                        />
                        <StatCard
                            title={t('onlineDevices')}
                            value={stats.online}
                            icon="fas fa-wifi"
                            color="bg-green-500"
                            change={calculateChange(stats.online, stats.online - 1)}
                            changeType="increase"
                        />
                        <StatCard
                            title={t('offlineDevices')}
                            value={stats.offline}
                            icon="fas fa-exclamation-triangle"
                            color="bg-red-500"
                            change={calculateChange(stats.offline, stats.offline + 1)}
                            changeType="decrease"
                        />
                        <StatCard
                            title={t('warningDevices')}
                            value={stats.warning}
                            icon="fas fa-exclamation-circle"
                            color="bg-yellow-500"
                            change={calculateChange(stats.warning, stats.warning - 1)}
                            changeType="increase"
                        />
                    </div>
                </div>
                
                {/* Right: device status chart */}
                <div className="xl:col-span-1 h-full">
                    <DeviceStatusChart stats={stats} />
                </div>
            </div>

            {/* Device performance trend chart - single row */}
            <div className="w-full">
                <PerformanceChart />
            </div>

            {/* Device list - full width display */}
            <div className="mt-4">
                <DeviceList />
            </div>
        </div>
    );
}

export default Dashboard