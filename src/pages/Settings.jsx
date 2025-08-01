import React, { useState, useEffect } from 'react';
import apiService from '@/services/api.js';
import mqttService from '@/services/mqtt.js';
import timezoneService from '@/services/timezone.js';
import languageService from '@/utils/i18n.js';
import { logManager } from '@/components/ui/MqttLogWindow.jsx';
import { useLanguage } from '@/hooks/useLanguage.js';

const Settings = () => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('mqtt'); // 'mqtt' or 'misc'
    const [mqttConfig, setMqttConfig] = useState({
        broker_url: 'url',
        port: 0,
        protocol: 'ws',
        username: '',
        password: '',
        heartbeat_topic: '/{client_id}/user/printer/heartbeat',
        task_status_topic: '/{client_id}/user/printer/task_status',
        command_topic: '/{client_id}/user/printer/command'
    });

    const [timezone, setTimezone] = useState('Asia/Shanghai');
    const [language, setLanguage] = useState('zh');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [mqttConnected, setMqttConnected] = useState(false);
    const [connecting, setConnecting] = useState(false);


    // Load MQTT configuration
    const loadMqttConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await apiService.getMqttConfig();
            if (response.data) {
                setMqttConfig(response.data);
            }
        } catch (err) {
            console.error('Failed to load MQTT configuration:', err);
            setError(t('loadingFailed'));
        } finally {
            setLoading(false);
        }
    };

    // Load timezone settings
    const loadTimezone = () => {
        setTimezone(timezoneService.getTimezone());
    };

    // Load language settings
    const loadLanguage = () => {
        setLanguage(languageService.getCurrentLanguage());
    };

    useEffect(() => {
        loadMqttConfig();
        loadTimezone();
        loadLanguage();
        
        // Listen for MQTT connection status
        const handleConnectionStatusChange = (data) => {
            setMqttConnected(data.status === 'connected');
        };
        
        // Initial check connection status
        setMqttConnected(mqttService.isConnected);
        
        // Register event listener
        mqttService.on('connectionStatusChanged', handleConnectionStatusChange);
        
        return () => {
            mqttService.off('connectionStatusChanged', handleConnectionStatusChange);
        };
    }, []);



    // Dynamically connect/disconnect MQTT
    const handleMqttConnection = async () => {
        try {
            setConnecting(true);
            setError(null);
            setSuccess(null);

            if (mqttConnected) {
                // If connected, disconnect
                mqttService.disconnect();
                setSuccess(t('mqttDisconnected'));
            } else {
                // If not connected, save config and connect
                await apiService.updateMqttConfig(mqttConfig);
                await mqttService.updateConfig(mqttConfig);
                setSuccess(t('mqttConnected'));
            }
        } catch (err) {
            console.error('MQTT connection operation failed:', err);
            setError(t('mqttOperationFailed') + ': ' + (err.message || 'Unknown error'));
        } finally {
            setConnecting(false);
        }
    };

    // Save timezone settings
    const handleSaveTimezone = () => {
        try {
            timezoneService.setTimezone(timezone);
            setSuccess(t('saveSuccess'));
        } catch (err) {
            console.error('Failed to save timezone settings:', err);
            setError(t('saveFailed') + ': ' + (err.message || 'Unknown error'));
        }
    };

    // Save language settings
    const handleSaveLanguage = () => {
        try {
            languageService.setLanguage(language);
            setSuccess(t('saveSuccess'));
        } catch (err) {
            console.error('Failed to save language settings:', err);
            setError(t('saveFailed') + ': ' + (err.message || 'Unknown error'));
        }
    };



    // Handle input changes
    const handleInputChange = (field, value) => {
        setMqttConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Handle timezone change
    const handleTimezoneChange = (value) => {
        setTimezone(value);
    };

    // Handle language change
    const handleLanguageChange = (value) => {
        setLanguage(value);
    };

    // Clear messages
    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    // Auto clear messages
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(clearMessages, 5000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">{t('loading')}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Tab navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('mqtt')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'mqtt'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-wifi mr-2"></i>
                            {t('mqttSettings')}
                        </button>
                        <button
                            onClick={() => setActiveTab('misc')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'misc'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-cog mr-2"></i>
                            {t('miscellaneous')}
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {/* MQTT Configuration Page */}
                    {activeTab === 'mqtt' && (
                        <div className="space-y-6">
                            


                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('mqttServerConfiguration')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('brokerUrl')}
                                        </label>
                                        <input
                                            type="text"
                                            value={mqttConfig.broker_url}
                                            onChange={(e) => handleInputChange('broker_url', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="broker.emqx.io"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('port')}
                                        </label>
                                        <input
                                            type="number"
                                            value={mqttConfig.port}
                                            onChange={(e) => handleInputChange('port', parseInt(e.target.value))}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="8083"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('protocol')}
                                        </label>
                                        <select
                                            value={mqttConfig.protocol}
                                            onChange={(e) => handleInputChange('protocol', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="ws">{t('websocket')}</option>
                                            <option value="wss">{t('websocketSecure')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('username')}
                                        </label>
                                        <input
                                            type="text"
                                            value={mqttConfig.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="emqx_test"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('password')}
                                        </label>
                                        <input
                                            type="password"
                                            value={mqttConfig.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="emqx_test"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-3">{t('topicConfiguration')}</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('heartbeatTopic')}
                                            </label>
                                            <input
                                                type="text"
                                                value={mqttConfig.heartbeat_topic}
                                                onChange={(e) => handleInputChange('heartbeat_topic', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="printer/{client_id}/heartbeat"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('taskStatusTopic')}
                                            </label>
                                            <input
                                                type="text"
                                                value={mqttConfig.task_status_topic}
                                                onChange={(e) => handleInputChange('task_status_topic', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="printer/{client_id}/task_status"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('commandResponseTopic')}
                                            </label>
                                            <input
                                                type="text"
                                                value={mqttConfig.command_topic}
                                                onChange={(e) => handleInputChange('command_topic', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="printer/{client_id}/command"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic connect button */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleMqttConnection}
                                    disabled={connecting}
                                    className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                                        mqttConnected 
                                            ? 'bg-red-600 text-white hover:bg-red-700' 
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    {connecting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin mr-2"></i>
                                            {t('connecting')}
                                        </>
                                    ) : mqttConnected ? (
                                        <>
                                            <i className="fas fa-unlink mr-2"></i>
                                            {t('disconnect')}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-link mr-2"></i>
                                            {t('connect')}
                                        </>
                                    )}
                                </button>
                            </div>

                            
                        </div>
                    )}

                    {/* Miscellaneous Settings Page */}
                    {activeTab === 'misc' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('systemSettings')}</h3>
                                
                                <div className="space-y-6">
                                    {/* Timezone Settings */}
                                    <div>
                                        <h4 className="text-md font-medium text-gray-900 mb-3">{t('timezoneSettings')}</h4>
                                        <div className="max-w-md">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('selectTimezone')}
                                            </label>
                                            <select
                                                value={timezone}
                                                onChange={(e) => handleTimezoneChange(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                {timezoneService.getAvailableTimezones().map(tz => (
                                                    <option key={tz.value} value={tz.value}>
                                                        {tz.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t('currentTimezone')}: {timezoneService.getCurrentTimezoneInfo().label}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {t('currentTime')}: {timezoneService.formatDateTime(new Date())}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Language Settings */}
                                    <div>
                                        <h4 className="text-md font-medium text-gray-900 mb-3">{t('languageSettings')}</h4>
                                        <div className="max-w-md">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {t('selectLanguage')}
                                            </label>
                                            <select
                                                value={language}
                                                onChange={(e) => handleLanguageChange(e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="zh">{t('chinese')}</option>
                                                <option value="en">{t('english')}</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {t('currentLanguage')}: {languageService.getLanguageDisplayName(language)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Other settings can be added here */}
                                    <div>
                                        <h4 className="text-md font-medium text-gray-900 mb-3">{t('otherSettings')}</h4>
                                        <p className="text-sm text-gray-600">
                                            {t('moreSystemSettingsOptions')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Operation Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={handleSaveTimezone}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <i className="fas fa-save mr-2"></i>
                                    {t('saveSettings')}
                                </button>
                                <button
                                    onClick={handleSaveLanguage}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <i className="fas fa-language mr-2"></i>
                                    {t('saveLanguage')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Message Notifications */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <i className="fas fa-exclamation-circle text-red-400"></i>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <i className="fas fa-check-circle text-green-400"></i>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-800">{success}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;