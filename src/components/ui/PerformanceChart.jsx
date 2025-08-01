import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useLanguage } from '@/hooks/useLanguage.js';
import performanceService from '@/services/performance.js';
import timezoneService from '@/services/timezone.js';

const PerformanceChart = () => {
    const { t } = useLanguage();
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('24h'); // 24h, 7d, 30d
    const [selectedMetrics, setSelectedMetrics] = useState(['onlineRate', 'responseTime', 'errorRate']);
    const [lastUpdate, setLastUpdate] = useState(null);

    // Load performance data
    const loadPerformanceData = async () => {
        try {
            setLoading(true);
            const data = performanceService.getPerformanceData();
            setPerformanceData(data);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Failed to load performance data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle metric display
    const toggleMetric = (metric) => {
        setSelectedMetrics(prev => 
            prev.includes(metric) 
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    // Get metric configuration
    const getMetricConfig = (metric) => {
        const configs = {
            onlineRate: {
                label: t('deviceOnlineRate'),
                color: '#3b82f6',
                bgColor: 'rgba(59, 130, 246, 0.1)',
                yAxisID: 'y',
                unit: '%'
            },
            responseTime: {
                label: t('averageResponseTime'),
                color: '#10b981',
                bgColor: 'rgba(16, 185, 129, 0.1)',
                yAxisID: 'y1',
                unit: 'ms'
            },
            errorRate: {
                label: t('errorRate'),
                color: '#ef4444',
                bgColor: 'rgba(239, 68, 68, 0.1)',
                yAxisID: 'y',
                unit: '%'
            },
            throughput: {
                label: t('throughput'),
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                yAxisID: 'y1',
                unit: ''
            }
        };
        return configs[metric];
    };

    // Listen for performance data updates
    useEffect(() => {
        const handlePerformanceUpdate = () => {
            loadPerformanceData();
        };

        // Initialize performance service
        performanceService.init();

        // Load initial data
        loadPerformanceData();

        // Listen for performance data update events
        performanceService.on('performanceDataUpdated', handlePerformanceUpdate);

        return () => {
            performanceService.off('performanceDataUpdated', handlePerformanceUpdate);
        };
    }, []);

    // Update chart
    useEffect(() => {
        if (chartRef.current && performanceData) {
            const ctx = chartRef.current.getContext('2d');
            
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            // Prepare chart data
            const labels = performanceData.onlineRate && performanceData.onlineRate.length > 0 
                ? performanceData.onlineRate.map((point, index) => {
                    const time = new Date(point.timestamp);
                    return timezoneService.formatTime(time);
                })
                : ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];

            const onlineRateData = performanceData.onlineRate && performanceData.onlineRate.length > 0 
                ? performanceData.onlineRate.map(point => point.value)
                : [85, 89, 92, 95, 91, 88];

            const responseTimeData = performanceData.responseTime && performanceData.responseTime.length > 0 
                ? performanceData.responseTime.map(point => point.value)
                : [120, 110, 105, 95, 108, 115];

            const errorRateData = performanceData.errorRate && performanceData.errorRate.length > 0 
                ? performanceData.errorRate.map(point => point.value)
                : [2, 1.5, 1.8, 1.2, 1.6, 1.9];

            // Dynamically generate datasets
            const datasets = selectedMetrics.map(metric => {
                const config = getMetricConfig(metric);
                const data = performanceData[metric] && performanceData[metric].length > 0 
                    ? performanceData[metric].map(point => point.value)
                    : [85, 89, 92, 95, 91, 88]; // Default data
                
                return {
                    label: config.label,
                    data: data,
                    borderColor: config.color,
                    backgroundColor: config.bgColor,
                    fill: true,
                    tension: 0.4,
                    yAxisID: config.yAxisID,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                };
            });

            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: t('time')
                            }
                        },
                        y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: {
                                display: true,
                                text: t('percentage')
                            },
                            min: 0,
                            max: 100
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            title: {
                                display: true,
                                text: t('responseTime')
                            },
                            min: 0,
                            max: 200,
                            grid: {
                                drawOnChartArea: false,
                            },
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top'
                        },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#3b82f6',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.parsed.y;
                                    const config = getMetricConfig(selectedMetrics[context.datasetIndex]);
                                    return `${label}: ${value.toFixed(1)}${config.unit}`;
                                }
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
    }, [performanceData, selectedMetrics, t]);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <i className="fas fa-chart-line text-blue-600 text-lg"></i>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{t('devicePerformanceTrend')}</h3>
                            <p className="text-sm text-gray-500">{t('realTimePerformanceMonitoring')}</p>
                        </div>
                    </div>
                    
                    {/* Last update time */}
                    {lastUpdate && (
                        <div className="text-xs text-gray-500 flex items-center">
                            <i className="fas fa-clock mr-1"></i>
                            {t('lastUpdate')}: {timezoneService.formatTime(lastUpdate)}
                        </div>
                    )}
                </div>
            </div>

            {/* Control panel */}
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    {/* Metric selector */}
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">{t('metrics')}:</span>
                        {['onlineRate', 'responseTime', 'errorRate', 'throughput'].map(metric => {
                            const config = getMetricConfig(metric);
                            const isSelected = selectedMetrics.includes(metric);
                            return (
                                <button
                                    key={metric}
                                    onClick={() => toggleMetric(metric)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                        isSelected
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                    style={{ borderColor: isSelected ? config.color : undefined }}
                                >
                                    <div className="flex items-center space-x-1">
                                        <div 
                                            className="w-2 h-2 rounded-full" 
                                            style={{ backgroundColor: config.color }}
                                        ></div>
                                        <span>{config.label}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Time range selector */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700">{t('timeRange')}:</span>
                        {['24h', '7d', '30d'].map(range => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                    timeRange === range
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                        
                        {/* Refresh button */}
                        <button
                            onClick={loadPerformanceData}
                            disabled={loading}
                            className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-sync-alt'} mr-1`}></i>
                            {t('refresh')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Chart area */}
            <div className="p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">{t('loadingPerformanceData')}</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        {(!performanceData || Object.keys(performanceData).every(key => !performanceData[key] || performanceData[key].length === 0)) ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-chart-line text-gray-400 text-2xl"></i>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-700 mb-2">{t('noPerformanceData')}</h3>
                                    <p className="text-gray-500 mb-4">{t('noPerformanceDataDescription')}</p>
                                    <button
                                        onClick={loadPerformanceData}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <i className="fas fa-sync-alt mr-2"></i>
                                        {t('loadData')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="chart-container relative" style={{ height: '400px' }}>
                                <canvas ref={chartRef} className="w-full h-full"></canvas>
                            </div>
                        )}
                        
                        {/* Data overview */}
                        {performanceData && selectedMetrics.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {selectedMetrics.map(metric => {
                                    const config = getMetricConfig(metric);
                                    const data = performanceData[metric];
                                    const latestValue = data && data.length > 0 ? data[data.length - 1].value : 0;
                                    const previousValue = data && data.length > 1 ? data[data.length - 2].value : latestValue;
                                    const change = latestValue - previousValue;
                                    const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0;
                                    
                                    return (
                                        <div key={metric} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <div 
                                                        className="w-3 h-3 rounded-full" 
                                                        style={{ backgroundColor: config.color }}
                                                    ></div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">{config.label}</p>
                                                        <p className="text-lg font-semibold text-gray-800">
                                                            {latestValue.toFixed(1)}{config.unit}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className={`text-xs font-medium ${
                                                    change >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {change >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PerformanceChart