import apiService from './api.js';
import mqttService from './mqtt.js';

// Simple EventEmitter implementation
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

class PerformanceService extends EventEmitter {
    constructor() {
        super(); // Call parent constructor
        this.performanceData = {
            onlineRate: [],
            responseTime: [],
            errorRate: [],
            throughput: []
        };
        this.maxDataPoints = 24; // Save 24 data points (24 hours)
        this.updateInterval = null;
    }

    // Initialize performance monitoring
    async init() {
        // Load historical performance data
        await this.loadHistoricalData();
        
        // Start real-time monitoring
        this.startMonitoring();
    }

    // Load historical performance data
    async loadHistoricalData() {
        try {
            const response = await apiService.getPerformanceData();
            if (response.data) {
                // Ensure data format is correct
                this.performanceData = {
                    onlineRate: response.data.onlineRate || [],
                    responseTime: response.data.responseTime || [],
                    errorRate: response.data.errorRate || [],
                    throughput: response.data.throughput || []
                };
            }
        } catch (error) {
            console.error('Failed to load performance data:', error);
            // If loading fails, use empty data
            this.performanceData = {
                onlineRate: [],
                responseTime: [],
                errorRate: [],
                throughput: []
            };
        }
    }

    // Start performance monitoring
    startMonitoring() {
        // Collect performance data every 5 minutes
        this.updateInterval = setInterval(() => {
            this.collectPerformanceData();
        }, 5 * 60 * 1000);

        // Collect data immediately
        this.collectPerformanceData();
    }

    // Collect performance data
    async collectPerformanceData() {
        try {
            const timestamp = new Date();
            
            // Get current device status
            const statsResponse = await apiService.getPrinterStats();
            const stats = statsResponse.data || { total: 0, online: 0, offline: 0, warning: 0 };
            
            // Calculate online rate
            const onlineRate = stats.total > 0 ? (stats.online / stats.total) * 100 : 0;
            
            // Calculate average response time (simulated data, in real projects can be obtained from actual devices)
            const responseTime = this.calculateAverageResponseTime();
            
            // Calculate error rate
            const errorRate = stats.total > 0 ? (stats.warning / stats.total) * 100 : 0;
            
            // Calculate throughput (simulated data)
            const throughput = this.calculateThroughput(stats);
            
            // Add data points
            this.addDataPoint('onlineRate', onlineRate, timestamp);
            this.addDataPoint('responseTime', responseTime, timestamp);
            this.addDataPoint('errorRate', errorRate, timestamp);
            this.addDataPoint('throughput', throughput, timestamp);
            
            // Save to database
            await this.savePerformanceData();
            
            // Emit performance data update event
            mqttService.emit('performanceDataUpdated', {
                onlineRate,
                responseTime,
                errorRate,
                throughput,
                timestamp
            });
            
        } catch (error) {
            console.error('Failed to collect performance data:', error);
        }
    }

    // Add data point
    addDataPoint(metric, value, timestamp) {
        this.performanceData[metric].push({
            value,
            timestamp: timestamp.toISOString()
        });
        
        // Maintain data point count limit
        if (this.performanceData[metric].length > this.maxDataPoints) {
            this.performanceData[metric].shift();
        }
    }

    // Calculate average response time (simulated)
    calculateAverageResponseTime() {
        // Simulate response time, in real projects should be obtained from actual devices
        const baseTime = 100; // Base response time 100ms
        const variation = Math.random() * 50 - 25; // ±25ms variation
        return Math.max(50, baseTime + variation);
    }

    // Calculate throughput (simulated)
    calculateThroughput(stats) {
        // Simulate throughput based on online device count
        const baseThroughput = 1000; // Base throughput
        const onlineFactor = stats.online / Math.max(stats.total, 1);
        const variation = Math.random() * 200 - 100; // ±100 variation
        return Math.max(100, baseThroughput * onlineFactor + variation);
    }

    // Save performance data to database
    async savePerformanceData() {
        try {
            // Get latest data points
            const latestOnlineRate = this.performanceData.onlineRate[this.performanceData.onlineRate.length - 1];
            const latestResponseTime = this.performanceData.responseTime[this.performanceData.responseTime.length - 1];
            const latestErrorRate = this.performanceData.errorRate[this.performanceData.errorRate.length - 1];
            const latestThroughput = this.performanceData.throughput[this.performanceData.throughput.length - 1];

            if (latestOnlineRate && latestResponseTime && latestErrorRate && latestThroughput) {
                await apiService.savePerformanceData({
                    onlineRate: latestOnlineRate.value,
                    responseTime: latestResponseTime.value,
                    errorRate: latestErrorRate.value,
                    throughput: latestThroughput.value
                });
            }
        } catch (error) {
            console.error('Failed to save performance data:', error);
        }
    }

    // Get performance data
    getPerformanceData() {
        return this.performanceData;
    }

    // Get recent data for N hours
    getRecentData(hours = 24) {
        const now = new Date();
        const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);
        
        const recentData = {};
        Object.keys(this.performanceData).forEach(metric => {
            recentData[metric] = this.performanceData[metric].filter(point => 
                new Date(point.timestamp) >= cutoff
            );
        });
        
        return recentData;
    }

    // Stop monitoring
    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Clean up data
    cleanup() {
        this.stopMonitoring();
    }
}

// Create singleton instance
const performanceService = new PerformanceService();

export default performanceService; 