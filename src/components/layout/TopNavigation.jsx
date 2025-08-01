import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage.js';
import mqttService from '@/services/mqtt.js';

const TopNavigation = () => {
    const { t, currentLanguage, setLanguage } = useLanguage();
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [mqttStatus, setMqttStatus] = useState('disconnected');

    const handleLanguageChange = (language) => {
        setLanguage(language);
        setShowLanguageMenu(false);
    };

    // Listen for MQTT connection status changes
    useEffect(() => {
        const updateMqttStatus = () => {
            if (mqttService.isConnected) {
                setMqttStatus('connected');
            } else {
                setMqttStatus('disconnected');
            }
        };

        // Listen for connection status change event
        const handleConnectionStatusChange = (data) => {
            setMqttStatus(data.status);
        };

        // Initial check
        updateMqttStatus();

        // Register event listener
        mqttService.on('connectionStatusChanged', handleConnectionStatusChange);

        // Periodically check connection status (as backup)
        const interval = setInterval(updateMqttStatus, 5000);

        return () => {
            mqttService.off('connectionStatusChanged', handleConnectionStatusChange);
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {/* MQTT Service Status */}
                    <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-lg">
                        <i className={`fas fa-wifi text-xs ${
                            mqttStatus === 'connected' ? 'text-green-500' : 
                            mqttStatus === 'error' ? 'text-red-500' : 'text-gray-400'
                        }`}></i>
                        <div className={`w-2 h-2 rounded-full ${
                            mqttStatus === 'connected' ? 'bg-green-500' : 
                            mqttStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-xs text-gray-600 font-medium">
                            {mqttStatus === 'connected' ? t('connected') : 
                             mqttStatus === 'error' ? t('connectionError') : t('disconnected')}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    {/* Language Switcher */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <i className="fas fa-globe"></i>
                            <span>{currentLanguage === 'zh' ? 'Chinese' : 'English'}</span>
                            <i className="fas fa-chevron-down text-xs"></i>
                        </button>
                        
                        {showLanguageMenu && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                    onClick={() => handleLanguageChange('zh')}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                        currentLanguage === 'zh' ? 'text-blue-600 font-medium' : 'text-gray-700'
                                    }`}
                                >
                                    Chinese
                                </button>
                                <button
                                    onClick={() => handleLanguageChange('en')}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                        currentLanguage === 'en' ? 'text-blue-600 font-medium' : 'text-gray-700'
                                    }`}
                                >
                                    English
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    {/* <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
                        <i className="fas fa-bell"></i>
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                            3
                        </span>
                    </button> */}

                    
                </div>
            </div>
            
            {/* Close dropdowns when clicking outside */}
            {(showLanguageMenu || showUserMenu) && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => {
                        setShowLanguageMenu(false);
                    }}
                ></div>
            )}
        </div>
    );
};

export default TopNavigation;