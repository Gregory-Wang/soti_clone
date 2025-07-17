import React from 'react'
import mockData from "@/utils/mockData.js";

const PrinterManagement = () => {
  return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">打印机管理</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">打印机总数</h3>
                                <p className="text-3xl font-bold">{mockData.stats.printers}</p>
                            </div>
                            <i className="fas fa-print text-4xl opacity-80"></i>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">正常运行</h3>
                                <p className="text-3xl font-bold">85</p>
                            </div>
                            <i className="fas fa-check-circle text-4xl opacity-80"></i>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">需要维护</h3>
                                <p className="text-3xl font-bold">4</p>
                            </div>
                            <i className="fas fa-tools text-4xl opacity-80"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">打印机功能</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <i className="fas fa-cog text-blue-500 text-2xl mb-2"></i>
                            <h4 className="font-medium text-gray-800">远程配置</h4>
                            <p className="text-sm text-gray-600">远程配置打印机设置和参数</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <i className="fas fa-download text-green-500 text-2xl mb-2"></i>
                            <h4 className="font-medium text-gray-800">固件更新</h4>
                            <p className="text-sm text-gray-600">自动更新打印机固件</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <i className="fas fa-shield-alt text-red-500 text-2xl mb-2"></i>
                            <h4 className="font-medium text-gray-800">安全管理</h4>
                            <p className="text-sm text-gray-600">管理打印机安全策略</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrinterManagement