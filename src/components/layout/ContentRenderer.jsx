import React from 'react';

import Dashboard from '@/pages/Dashboard';
import DeviceManagement from '@/pages/DeviceManagement';
import PrinterManagement from '@/pages/PrinterManagement';
import VisualBoard from '@/pages/VisualBoard';
import Settings from '@/pages/Settings';
import LanguageTest from '@/components/ui/LanguageTest';
import LogManagerTest from '@/components/ui/LogManagerTest';
import MqttConnectionTest from '@/components/ui/MqttConnectionTest';

export default function ContentRenderer ({ activeTab, onNavigateToSettings }) {
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard onNavigateToSettings={onNavigateToSettings} />;
            case 'deviceManagement':
                return <DeviceManagement />;
            // case 'printerManagement':
            //     return <PrinterManagement />;
            // case 'visualBoard':
            //     return <VisualBoard />;
            // case 'languageTest':
            //     return <LanguageTest />;
            // case 'logManagerTest':
            //     return <LogManagerTest />;
            // case 'mqttConnectionTest':
            //     return <MqttConnectionTest />;
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard onNavigateToSettings={onNavigateToSettings} />;
        }
    };

    return (
        <div className="flex-1 p-6 overflow-y-auto min-w-0">
            {renderContent()}
        </div>
    );
};