import React from 'react'
import DeviceList from "@/components/ui/DeviceList.jsx";
import { useState } from "react";


const DeviceManagement = () => {
  return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">设备管理</h2>
                
                <div className="flex flex-wrap gap-4 mb-6">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i className="fas fa-plus mr-2"></i>添加设备
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                        <i className="fas fa-download mr-2"></i>批量导入
                    </button>
                    <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                        <i className="fas fa-sync mr-2"></i>同步设备
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800">设备发现</h3>
                        <p className="text-sm text-blue-600">自动发现网络中的新设备</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800">配置管理</h3>
                        <p className="text-sm text-green-600">统一管理设备配置策略</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-purple-800">组织结构</h3>
                        <p className="text-sm text-purple-600">按组织架构管理设备</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-orange-800">生命周期</h3>
                        <p className="text-sm text-orange-600">完整的设备生命周期管理</p>
                    </div>
                </div>
            </div>
            
            <DeviceList />
        </div>
    );
}

export default DeviceManagement