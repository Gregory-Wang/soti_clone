import mqtt from 'mqtt';
import apiService from './api.js';
import { logManager } from '@/components/ui/MqttLogWindow.jsx';

// EventEmitter class for handling events
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

// MQTT Service class for managing MQTT connections and message handling
class MqttService extends EventEmitter {
    constructor() {
        super();
        this.client = null;
        this.isConnected = false;
        this.config = null;
        this.printers = [];
        this.subscriptions = new Map();
        this.heartbeatTimers = new Map();
        this.manualDisconnect = false;
    }

    // Initialize MQTT service
    async init() {
        try {
            // Check if already initialized
            if (this.isConnected && this.client) {
                return;
            }
            
            // Get MQTT configuration
            const response = await apiService.getMqttConfig();
            this.config = response.data;
            
            // Get printer list
            const printersResponse = await apiService.getPrinters();
            this.printers = printersResponse.data || [];
            
            // Connect to MQTT server
            await this.connect();
            
            // Subscribe to all printer topics
            this.subscribeAllPrinters();
            
            // Start heartbeat monitoring
            this.startHeartbeatCheck();
            
        } catch (error) {
            console.error('MQTT service initialization failed:', error);
        }
    }

    // Connect to MQTT server
    async connect() {
        return new Promise((resolve, reject) => {
            // Check if configuration exists
            if (!this.config) {
                reject(new Error('MQTT configuration not initialized, please get configuration first'));
                return;
            }

            const { broker_url, port, protocol, username, password } = this.config;
            
            // Validate required configuration
            if (!broker_url) {
                reject(new Error('MQTT server address cannot be empty'));
                return;
            }

            // Use reference code connection method
            const mqttProtocol = protocol || 'ws'; // Default to ws protocol
            const host = broker_url;
            const clientId = `soti_clone_${Math.random().toString(16).slice(3)}`;
            const mqttPort = port || 8083; // Default to 8083 port
            
            const url = `${mqttProtocol}://${host}:${mqttPort}/mqtt`;
            
            const options = {
                clientId,
                username: username || 'emqx_test', // Use default username
                password: password || 'emqx_test', // Use default password
                clean: true,
                reconnectPeriod: 0, // Disable auto-reconnect, control manually
                connectTimeout: 30000,
            };

            this.client = mqtt.connect(url, options);

            this.client.on('connect', () => {
                logManager.success('mqtt_connect', 'MQTT connection successful', { url });
                this.isConnected = true;
                this.emit('connectionStatusChanged', { status: 'connected' });
                resolve();
            });

            this.client.on('error', (error) => {
                console.error('MQTT connection error:', error);
                logManager.error('mqtt_error', 'MQTT connection error', { error: error.message, url });
                this.isConnected = false;
                this.emit('connectionStatusChanged', { status: 'error' });
                reject(error);
            });

            this.client.on('close', () => {
                logManager.warning('mqtt_connect', 'MQTT connection closed');
                this.isConnected = false;
                this.emit('connectionStatusChanged', { status: 'disconnected' });
                
                // If not manually disconnected, try to reconnect
                if (this.config && !this.manualDisconnect) {
                    setTimeout(() => {
                        this.connect().catch(error => {
                            logManager.error('mqtt_connect', 'Auto-reconnect failed', { error: error.message });
                        });
                    }, 5000); // Reconnect after 5 seconds
                }
            });

            this.client.on('reconnect', () => {
                logManager.info('mqtt_connect', 'MQTT reconnecting...');
            });

            this.client.on('message', (topic, message) => {
                this.handleMessage(topic, message);
            });
        });
    }

    // Send message
    sendMessage(topic, message) {
        this.client.publish(topic, message);
    }

    // Handle received messages
    handleMessage(topic, message) {
        try {
            const payload = JSON.parse(message.toString());
            logManager.info('mqtt_message', 'Received MQTT message', { topic, payload });

            const topicParts = topic.split('/');
            const clientId = topicParts[1];
            
            const printer = this.printers.find(p => p.client_id === clientId);

            if (!printer) {
                console.warn('Printer not found:', clientId);
                logManager.warning('mqtt_message', 'Printer not found', { clientId, topic });
                return;
            }

            const stockTopicGroup = {
                'heartbeat':   this.config.heartbeat_topic,//Get topic configured in database, don't replace {client_id} yet
                'task_status': this.config.task_status_topic,
                'command': this.config.command_topic
            }

            stockTopicGroup.heartbeat = stockTopicGroup.heartbeat.replace('{client_id}', clientId);
            stockTopicGroup.task_status = stockTopicGroup.task_status.replace('{client_id}', clientId);
            stockTopicGroup.command = stockTopicGroup.command.replace('{client_id}', clientId);

            // Handle message based on actual message type
            switch (topic) {
                case stockTopicGroup.heartbeat:
                    this.handleHeartbeat(printer.id, payload);
                    break;
                case stockTopicGroup.task_status:
                    this.handleTaskStatus(printer.id, payload);
                    break;
                case stockTopicGroup.command:
                    this.handleCommand(printer.id, payload);
                    break;
                default:
                    logManager.warning('mqtt_message', 'Unknown message type', { topic });
            }
            
        } catch (error) {
            console.error('Failed to process MQTT message:', error);
            logManager.error('mqtt_error', 'Failed to process MQTT message', { error: error.message, topic, message: message.toString() });
        }
    }

    // Handle heartbeat messages
    async handleHeartbeat(printerId, payload) {
        try {
            // Use status code directly from heartbeat packet
            const status = parseInt(payload.status);
            const deviceSn = payload.deviceSn;
            const firmwareVersion = payload.firmwareVersion;

            // Update printer heartbeat status
            await apiService.updatePrinterHeartbeat(printerId, status, firmwareVersion, deviceSn);
            
            // Clear heartbeat timeout timer
            if (this.heartbeatTimers.has(printerId)) {
                clearTimeout(this.heartbeatTimers.get(printerId));
                this.heartbeatTimers.delete(printerId);
            }

            // Set 40-second timeout timer
            const timeoutId = setTimeout(async () => {
                try {
                    await apiService.updatePrinterHeartbeat(printerId, 1, firmwareVersion, deviceSn);
                    this.emit('heartbeatUpdate', {
                        printerId,
                        status,
                        deviceSn,
                        firmwareVersion,
                        timestamp: new Date(),
                        message: `Printer ${printerId} heartbeat timeout, marked as disconnected`
                    });
                } catch (error) {
                    console.error(`Failed to update timeout status for printer ${printerId}:`, error);
                }
            }, 40000); // 40-second timeout

            this.heartbeatTimers.set(printerId, timeoutId);


            
            logManager.info('heartbeat', `Printer heartbeat update: status code ${status}`, { 
                printerId, 
                status: status,
                deviceSn,
                firmwareVersion
            });

            // Emit heartbeat update event - with detailed information
            const eventData = {
                printerId,
                status,
                deviceSn,
                firmwareVersion,
                timestamp: new Date(),
                message: `Printer ${printerId} status updated to: ${status}`
            };
            
            this.emit('heartbeatUpdate', eventData);
            
        } catch (error) {
            console.error('Failed to update heartbeat status:', error);
            logManager.error('heartbeat', 'Failed to update heartbeat status', { printerId, error: error.message });
            
            // Even if update fails, emit event to notify UI
            this.emit('heartbeatUpdate', {
                printerId,
                error: error.message,
                timestamp: new Date()
            });
        }
    }

    // Handle task status messages
    handleTaskStatus(printerId, payload) {
        // Add task status processing logic here
    }

    // Handle command response messages
    handleCommand(printerId, payload) {
        // Add command response processing logic here
    }

    // Subscribe to all printer topics
    subscribeAllPrinters() {
        if (!this.isConnected || !this.client) {
            return;
        }

        this.printers.forEach(printer => {
            this.subscribePrinter(printer);
        });
    }

    // Subscribe to single printer topic
    subscribePrinter(printer) {
        if (!this.isConnected || !this.client) {
            return;
        }

        const { heartbeat_topic, task_status_topic, command_topic } = this.config;
        
        // Replace {client_id} in topics
        const topics = [
            heartbeat_topic.replace('{client_id}', printer.client_id),
            task_status_topic.replace('{client_id}', printer.client_id),
            command_topic.replace('{client_id}', printer.client_id)
        ];

        topics.forEach(topic => {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    logManager.error('mqtt_connect', `Failed to subscribe to topic: ${topic}`, { error: err.message });
                } else {
                    // logManager.success('mqtt_connect', `Successfully subscribed to topic: ${topic}`, { topic });
                    this.subscriptions.set(topic, printer.id);
                }
            });
        });
    }

    // Unsubscribe from printer topics
    unsubscribePrinter(printer) {
        if (!this.isConnected || !this.client) {
            return;
        }

        const { heartbeat_topic, task_status_topic, command_topic } = this.config;
        
        const topics = [
            heartbeat_topic.replace('{client_id}', printer.client_id),
            task_status_topic.replace('{client_id}', printer.client_id),
            command_topic.replace('{client_id}', printer.client_id)
        ];

        topics.forEach(topic => {
            this.client.unsubscribe(topic, (err) => {
                if (err) {
                    logManager.error('mqtt_connect', `Failed to unsubscribe from topic: ${topic}`, { error: err.message });
                } else {
                    // logManager.info('mqtt_connect', `Successfully unsubscribed from topic: ${topic}`, { topic });
                    this.subscriptions.delete(topic);
                }
            });
        });
    }

    // Start heartbeat monitoring
    startHeartbeatCheck() {
        // Check heartbeat every 30 seconds
        setInterval(() => {
            this.checkHeartbeats();
        }, 30000);
    }

    // Check heartbeat timeouts
    async checkHeartbeats() {
        try {
            const printersResponse = await apiService.getPrinters();
            const printers = printersResponse.data || [];

            printers.forEach(printer => {
                const lastHeartbeat = printer.last_heartbeat;
                if (lastHeartbeat) {
                    const lastHeartbeatTime = new Date(lastHeartbeat);
                    const now = new Date();
                    const diffSeconds = (now - lastHeartbeatTime) / 1000;

                    // Mark as offline if no heartbeat for more than 40 seconds
                    if (diffSeconds > 40) {
                        logManager.warning('heartbeat', `Printer heartbeat timeout: ${printer.name}`, { 
                            printerId: printer.id, 
                            printerName: printer.name, 
                            lastHeartbeat, 
                            diffSeconds 
                        });
                        apiService.updatePrinterHeartbeat(printer.id, 1, null, printer.firmware_version, printer.device_sn);
                    }
                } else {
                    // Mark as offline if never connected
                    logManager.warning('heartbeat', `Printer never connected: ${printer.name}`, { 
                        printerId: printer.id, 
                        printerName: printer.name 
                    });
                        apiService.updatePrinterHeartbeat(printer.id, 1, null, printer.firmware_version, printer.device_sn);
                }
            });
        } catch (error) {
            console.error('Failed to check heartbeats:', error);
        }
    }

    // Add printer and subscribe to its topic
    async addPrinter(printer) {
        this.printers.push(printer);
        this.subscribePrinter(printer);
        
                    // Emit printer add event
        this.emit('printerAdded', { printer });
    }

    // Remove printer and unsubscribe from its topic
    async removePrinter(printer) {
        this.unsubscribePrinter(printer);
        this.printers = this.printers.filter(p => p.id !== printer.id);
    }

    // Update MQTT configuration
    async updateConfig(newConfig) {
        try {
            // If already connected, disconnect completely first
            if (this.isConnected && this.client) {
                // Remove all event listeners
                this.client.removeAllListeners();
                // Force disconnect
                this.client.end(true);
                this.isConnected = false;
                this.client = null;
                
                // Wait a short time to ensure connection is completely disconnected
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Update configuration
            this.config = newConfig;
            
            // Reconnect
            await this.connect();
            
            // Resubscribe to all printer topics
            this.subscribeAllPrinters();
            
            logManager.info('mqtt_config', 'MQTT configuration updated and reconnected successfully', { 
                broker_url: newConfig.broker_url,
                port: newConfig.port 
            });
            
        } catch (error) {
            logManager.error('mqtt_config', 'Failed to update MQTT configuration', { 
                error: error.message,
                config: newConfig 
            });
            throw error;
        }
    }

    // Disconnect from MQTT
    disconnect() {
        if (this.client) {
            this.manualDisconnect = true;
            this.client.end();
            this.isConnected = false;
            this.client = null;
            
            // Reset manual disconnect flag
            setTimeout(() => {
                this.manualDisconnect = false;
            }, 1000);
        }
    }
}

// Create singleton instance
const mqttService = new MqttService();

export default mqttService; 