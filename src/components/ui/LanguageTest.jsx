import React from 'react';
import { useLanguage } from '@/hooks/useLanguage.js';

const LanguageTest = () => {
    const { t, currentLanguage, setLanguage } = useLanguage();

    const testKeys = [
        'dashboard',
        'deviceManagement',
        'printerManagement',
        'settings',
        'visualBoard',
        'totalDevices',
        'onlineDevices',
        'offlineDevices',
        'warningDevices',
        'addDevice',
        'syncDevices',
        'deviceList',
        'status',
        'online',
        'offline',
        'warning',
        'unknown',
        'loading',
        'retry',
        'noDevices'
    ];

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Language Switch Test</h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setLanguage('zh')}
                        className={`px-3 py-1 rounded ${currentLanguage === 'zh' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        English
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={`px-3 py-1 rounded ${currentLanguage === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        English
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="text-lg font-semibold mb-3">Current Language: {currentLanguage}</h3>
                    <div className="space-y-2">
                        {testKeys.map(key => (
                            <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-600">{key}:</span>
                                <span className="text-sm font-medium">{t(key)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-3">Function Test</h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">Navigation Menu</h4>
                            <div className="space-y-1">
                                <div className="text-sm">{t('dashboard')}</div>
                                <div className="text-sm">{t('deviceManagement')}</div>
                                <div className="text-sm">{t('printerManagement')}</div>
                                <div className="text-sm">{t('settings')}</div>
                                <div className="text-sm">{t('visualBoard')}</div>
                            </div>
                        </div>

                        <div className="p-4 bg-green-50 rounded-lg">
                            <h4 className="font-medium text-green-800 mb-2">Device Status</h4>
                            <div className="space-y-1">
                                <div className="text-sm">{t('online')}</div>
                                <div className="text-sm">{t('offline')}</div>
                                <div className="text-sm">{t('warning')}</div>
                                <div className="text-sm">{t('unknown')}</div>
                            </div>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                            <h4 className="font-medium text-purple-800 mb-2">Action Buttons</h4>
                            <div className="space-y-1">
                                <div className="text-sm">{t('addDevice')}</div>
                                <div className="text-sm">{t('syncDevices')}</div>
                                <div className="text-sm">{t('retry')}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LanguageTest; 