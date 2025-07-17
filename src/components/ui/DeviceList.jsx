import React from 'react'
import mockData from '@/utils/mockData';


const DeviceList = () => {
  const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'status-online';
            case 'offline': return 'status-offline';
            case 'warning': return 'status-warning';
            default: return 'bg-gray-400';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'online': return '在线';
            case 'offline': return '离线';
            case 'warning': return '警告';
            default: return '未知';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">设备列表</h3>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <i className="fas fa-plus mr-2"></i>添加设备
                    </button>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">设备名称</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">位置</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">电池</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">温度</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后在线</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {mockData.devices.map(device => (
                            <tr key={device.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                                            device.type === 'printer' ? 'bg-purple-100' : 'bg-green-100'
                                        }`}>
                                            <i className={`fas ${device.type === 'printer' ? 'fa-print' : 'fa-mobile-alt'} ${
                                                device.type === 'printer' ? 'text-purple-600' : 'text-green-600'
                                            }`}></i>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{device.name}</div>
                                            <div className="text-sm text-gray-500">ID: {device.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        device.type === 'printer' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                        {device.type === 'printer' ? '打印机' : '移动设备'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(device.status)}`}></div>
                                        <span className="text-sm text-gray-900">{getStatusText(device.status)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                            <div 
                                                className={`h-2 rounded-full ${device.battery > 50 ? 'bg-green-500' : device.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                style={{width: `${device.battery}%`}}
                                            ></div>
                                        </div>
                                        <span className="text-sm text-gray-900">{device.battery}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{device.temperature}°C</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.lastSeen}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                                        <i className="fas fa-edit"></i>
                                    </button>
                                    <button className="text-red-600 hover:text-red-900">
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default DeviceList