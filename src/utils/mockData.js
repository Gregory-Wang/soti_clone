const mockData = {
    devices: [
        { id: 1, name: '打印机-仓库A-001', type: 'printer', status: 'online', location: '仓库A', battery: 85, temperature: 32, lastSeen: '2分钟前' },
        { id: 2, name: '打印机-零售店-002', type: 'printer', status: 'online', location: '零售店', battery: 92, temperature: 28, lastSeen: '5分钟前' },
        { id: 3, name: '打印机-配送中心-003', type: 'printer', status: 'warning', location: '配送中心', battery: 23, temperature: 45, lastSeen: '1小时前' },
        { id: 4, name: '移动终端-001', type: 'mobile', status: 'offline', location: '办公室', battery: 67, temperature: 35, lastSeen: '3小时前' },
        { id: 5, name: '移动终端-002', type: 'mobile', status: 'online', location: '仓库B', battery: 78, temperature: 30, lastSeen: '刚刚' },
    ],
    stats: {
        totalDevices: 156,
        onlineDevices: 142,
        offlineDevices: 14,
        warningDevices: 8,
        printers: 89,
        mobileDevices: 67
    }
};

export default mockData;