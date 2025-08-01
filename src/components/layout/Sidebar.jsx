import React from 'react';
import { useLanguage } from '@/hooks/useLanguage.js';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
    const { t } = useLanguage();

    const menuItems = [
        { id: 'dashboard', icon: 'fas fa-tachometer-alt', label: t('dashboard') },
        { id: 'deviceManagement', icon: 'fas fa-desktop', label: t('deviceManagement') },
        { id: 'settings', icon: 'fas fa-cog', label: t('settings') }
    ];

    return (
        <div className={`bg-white shadow-sm border-r border-gray-200 transition-all duration-300 flex-shrink-0 ${isCollapsed ? 'w-16' : 'w-64'}`}>
            <div className={`${isCollapsed ? 'p-2' : 'p-4'}`}>
                {/* Title and collapse button */}
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} mb-6`}>
                    {!isCollapsed && (
                        <h1 className="text-xl font-bold text-gray-800 transition-opacity duration-300">Xprinter MQTT Printer Demo</h1>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={`p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 ${
                            isCollapsed ? 'w-8 h-8' : 'w-10'
                        }`}
                        title={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
                    >
                        <i className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'} text-gray-600 text-sm transition-transform duration-200`}></i>
                    </button>
                </div>
            
                
                {/* Navigation menu */}
                <nav className="space-y-1">
                    {menuItems.map(item => (
                        <div key={item.id} className="relative group">
                            <button
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center rounded-lg transition-all duration-200 ${
                                    isCollapsed 
                                        ? 'justify-center px-2 py-3 hover:bg-gray-50 hover:shadow-sm' 
                                        : 'px-3 py-2'
                                } ${
                                    activeTab === item.id
                                        ? 'bg-blue-100 text-blue-700 shadow-sm border border-blue-200'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                title={isCollapsed ? item.label : ''}
                            >
                                <i className={`${item.icon} ${isCollapsed ? 'text-lg' : 'w-5 h-5'} ${
                                    activeTab === item.id ? 'text-blue-600' : 'text-gray-500'
                                } transition-colors duration-200`}></i>
                                {!isCollapsed && (
                                    <span className="ml-3 text-sm font-medium truncate transition-opacity duration-200">{item.label}</span>
                                )}
                            </button>
                            
                            {/* Tooltip when collapsed */}
                            {isCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
                
                {/* Separator when collapsed */}
                {isCollapsed && (
                    <div className="mt-4 border-t border-gray-200 transition-opacity duration-300"></div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;