import React from 'react'
import { useLanguage } from '@/hooks/useLanguage.js';

const StatCard = ({ title, value, icon, color, change, changeType }) => {
    const { t } = useLanguage();
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
        {/* Header - consistent with DeviceStatusChart */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
            <div className="flex items-center space-x-2">
                <div className={`p-1.5 rounded-lg ${color.replace('bg-', 'bg-').replace('500', '100')}`}>
                    <i className={`${icon} ${color.replace('bg-', 'text-').replace('500', '600')} text-sm`}></i>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
                    <p className="text-xs text-gray-500">{t('realTimeStatistics')}</p>
                </div>
            </div>
        </div>
        
        {/* Content area */}
        <div className="p-4 flex-1 flex flex-col justify-center">
            <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-2 transition-all duration-300 ease-in-out">{value}</p>
                {change && (
                    <div className="flex items-center justify-center">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-300 ${
                            changeType === 'increase' 
                                ? 'text-green-600 bg-green-50' 
                                : 'text-red-600 bg-red-50'
                        }`}>
                            {changeType === 'increase' ? '↑' : '↓'} {change}
                        </span>
                    </div>
                )}
            </div>
        </div>
    </div>
);
}

export default StatCard