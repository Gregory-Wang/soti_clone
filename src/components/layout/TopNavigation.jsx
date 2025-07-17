import React from 'react';

export default function TopNavigation() {
    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="搜索设备、位置或状态..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                        />
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <i className="fas fa-bell text-lg"></i>
                        {/* <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> */}
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <i className="fas fa-question-circle text-lg"></i>
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-600 text-sm"></i>
                        </div>
                        <span className="text-sm font-medium text-gray-700">管理员</span>
                    </div>
                </div>
            </div>
        </header>
    );
};