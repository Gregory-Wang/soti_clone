import React from 'react'

const StatCard = ({ title, value, icon, color, change, changeType }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover-scale">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                {change && (
                    <p className={`text-sm mt-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                        <i className={`fas ${changeType === 'increase' ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
                        {change}
                    </p>
                )}
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
                <i className={`${icon} text-white text-xl`}></i>
            </div>
        </div>
    </div>
);
}

export default StatCard