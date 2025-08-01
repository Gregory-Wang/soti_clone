import React from 'react'
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useLanguage } from '@/hooks/useLanguage.js';

const DeviceStatusChart = ({ stats = { online: 0, offline: 0, warning: 0 } }) => {
    const { t } = useLanguage();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);

    useEffect(() => {
        if (chartRef.current) {
            const ctx = chartRef.current.getContext('2d');
            
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Use the passed stats data
            const chartData = [stats.online || 0, stats.offline || 0, stats.warning || 0];

            chartInstance.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: [t('online'), t('offline'), t('warning')],
                    datasets: [{
                        data: chartData,
                        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
        };
            }, [stats, t]); // Add t as dependency

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 flex-shrink-0">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-green-100 rounded-lg">
                        <i className="fas fa-chart-pie text-green-600 text-sm"></i>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800">{t('deviceStatusDistribution')}</h3>
                        <p className="text-xs text-gray-500">{t('deviceStatusOverview')}</p>
                    </div>
                </div>
            </div>
            
            {/* Chart area */}
            <div className="p-4 flex-1">
                <div className="chart-container h-full">
                    <canvas ref={chartRef} className="w-full h-full"></canvas>
                </div>
            </div>
        </div>
    );
}

export default DeviceStatusChart