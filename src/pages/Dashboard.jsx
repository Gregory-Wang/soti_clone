import React from 'react';
import StatCard from '@/components/ui/StatCard';
import DeviceStatusChart from '@/components/ui/DeviceStatusChart';
import PerformanceChart from '@/components/ui/PerformanceChart';
import DeviceList from '@/components/ui/DeviceList';
import mockData from '@/utils/mockData';

const Dashboard = () => {
  return (
        <div className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="设备总数"
                    value={mockData.stats.totalDevices}
                    icon="fas fa-desktop"
                    color="bg-blue-500"
                    change="+8%"
                    changeType="increase"
                />
                <StatCard
                    title="在线设备"
                    value={mockData.stats.onlineDevices}
                    icon="fas fa-wifi"
                    color="bg-green-500"
                    change="+12%"
                    changeType="increase"
                />
                <StatCard
                    title="离线设备"
                    value={mockData.stats.offlineDevices}
                    icon="fas fa-exclamation-triangle"
                    color="bg-red-500"
                    change="-5%"
                    changeType="decrease"
                />
                <StatCard
                    title="警告设备"
                    value={mockData.stats.warningDevices}
                    icon="fas fa-exclamation-circle"
                    color="bg-yellow-500"
                    change="+3%"
                    changeType="increase"
                />
            </div>

            {/* 图表区域 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DeviceStatusChart />
                <PerformanceChart />
            </div>

            {/* 设备列表 */}
            <DeviceList />
        </div>
    );
}

export default Dashboard