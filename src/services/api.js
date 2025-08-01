// API Service for handling backend communication
class ApiService {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Get all printers
    async getPrinters() {
        return this.request('/printers');
    }

    // Add printer
    async addPrinter(name, clientId) {
        return this.request('/printers', {
            method: 'POST',
            body: JSON.stringify({ name, client_id: clientId })
        });
    }

    // Update printer status
    async updatePrinterStatus(id, status) {
        return this.request(`/printers/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Update printer basic information
    async updatePrinter(id, name, clientId) {
        return this.request(`/printers/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name, client_id: clientId })
        });
    }

    // Update printer heartbeat
    async updatePrinterHeartbeat(id, status, firmwareVersion, deviceSn) {
        return this.request(`/printers/${id}/heartbeat`, {
            method: 'PUT',
            body: JSON.stringify({ 
                status: status,
                firmware_version: firmwareVersion,
                device_sn: deviceSn
            })
        });
    }

    // Delete printer
    async deletePrinter(id) {
        return this.request(`/printers/${id}`, {
            method: 'DELETE'
        });
    }

    // Get printer statistics
    async getPrinterStats() {
        return this.request('/printers/stats');
    }

    // MQTT configuration related APIs

    // Get MQTT configuration
    async getMqttConfig() {
        return this.request('/mqtt/config');
    }

    // Update MQTT configuration
    async updateMqttConfig(config) {
        return this.request('/mqtt/config', {
            method: 'PUT',
            body: JSON.stringify(config)
        });
    }

    // Performance data related APIs

    // Get performance data
    async getPerformanceData() {
        return this.request('/performance/data');
    }

    // Save performance data
    async savePerformanceData(data) {
        return this.request('/performance/data', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Get performance statistics
    async getPerformanceStats() {
        return this.request('/performance/stats');
    }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService; 