import React from 'react';

export default function Sidebar ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) {
    const menuItems = [
        { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: '仪表板', color: 'text-blue-600' },
        { id: 'devices', icon: 'fas fa-desktop', label: '设备管理', color: 'text-green-600' },
        { id: 'printers', icon: 'fas fa-print', label: '打印机', color: 'text-purple-600' },
        { id: 'visual', icon: 'fas fa-chart-bar', label: '可视化面板', color: 'text-orange-600' },
        { id: 'security', icon: 'fas fa-shield-alt', label: '安全管理', color: 'text-red-600' },
        { id: 'automation', icon: 'fas fa-cogs', label: '自动化规则', color: 'text-indigo-600' },
        { id: 'settings', icon: 'fas fa-cog', label: '设置', color: 'text-gray-600' },
    ];
    
    return (
        <div className={`bg-white shadow-lg sidebar-transition ${isCollapsed ? 'w-16' : 'w-64'}`}>
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <i className="fas fa-cube text-white text-sm"></i>
                        </div>
                        {!isCollapsed && (
                            <div className="ml-3">
                                <h1 className="text-xl font-bold text-gray-800">SOTI Connect</h1>
                                <p className="text-xs text-gray-500">设备管理平台</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-gray-500`}></i>
                    </button>
                </div>
            </div>
            
            <nav className="mt-4">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                            activeTab === item.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                        }`}
                    >
                        <i className={`${item.icon} ${item.color} text-lg ${isCollapsed ? 'text-center w-full' : ''}`}></i>
                        {!isCollapsed && (
                            <span className={`ml-3 text-gray-700 ${activeTab === item.id ? 'font-medium text-blue-600' : ''}`}>
                                {item.label}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </div>
    );
};