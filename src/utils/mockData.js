const mockData = {
    devices: [
        { id: 1, name: 'Printer-WarehouseA-001', type: 'printer', status: 'online', location: 'Warehouse A', battery: 85, temperature: 32, lastSeen: '2 minutes ago' },
        { id: 2, name: 'Printer-RetailStore-002', type: 'printer', status: 'online', location: 'Retail Store', battery: 92, temperature: 28, lastSeen: '5 minutes ago' },
        { id: 3, name: 'Printer-DistributionCenter-003', type: 'printer', status: 'warning', location: 'Distribution Center', battery: 23, temperature: 45, lastSeen: '1 hour ago' },
        { id: 4, name: 'MobileTerminal-001', type: 'mobile', status: 'offline', location: 'Office', battery: 67, temperature: 35, lastSeen: '3 hours ago' },
        { id: 5, name: 'MobileTerminal-002', type: 'mobile', status: 'online', location: 'Warehouse B', battery: 78, temperature: 30, lastSeen: 'Just now' },
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