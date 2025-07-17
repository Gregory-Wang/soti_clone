import React from 'react';

import Dashboard from '@/pages/Dashboard';
import DeviceManagement from '@/pages/DeviceManagement';
import PrinterManagement from '@/pages/PrinterManagement';
import VisualBoard from '@/pages/VisualBoard';
import Settings from '@/pages/Settings';

export default function ContentRenderer ({ activeTab }) {
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard />;
            case 'devices':
                return <DeviceManagement />;
            case 'printers':
                return <PrinterManagement />;
            case 'visual':
                return <VisualBoard />;
            case 'security':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">安全管理</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="bg-red-50 p-6 rounded-lg">
                                <i className="fas fa-shield-alt text-red-500 text-3xl mb-4"></i>
                                <h3 className="font-semibold text-red-800 mb-2">威胁监控</h3>
                                <p className="text-sm text-red-600">实时监控设备安全威胁</p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-lg">
                                <i className="fas fa-key text-blue-500 text-3xl mb-4"></i>
                                <h3 className="font-semibold text-blue-800 mb-2">证书管理</h3>
                                <p className="text-sm text-blue-600">管理设备安全证书</p>
                            </div>
                            <div className="bg-green-50 p-6 rounded-lg">
                                <i className="fas fa-lock text-green-500 text-3xl mb-4"></i>
                                <h3 className="font-semibold text-green-800 mb-2">访问控制</h3>
                                <p className="text-sm text-green-600">配置设备访问权限</p>
                            </div>
                        </div>
                    </div>
                );
            case 'automation':
                return (
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">自动化规则</h2>
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">注册规则</h3>
                                <p className="text-sm text-gray-600">自动发现并注册新设备</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">配置规则</h3>
                                <p className="text-sm text-gray-600">自动应用配置策略</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold text-gray-800 mb-2">监控规则</h3>
                                <p className="text-sm text-gray-600">自动监控设备状态</p>
                            </div>
                        </div>
                    </div>
                );
            case 'settings':
                return <Settings />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex-1 p-6 scroll-auto overflow-y-auto">
            {renderContent()}
        </div>
    );
};