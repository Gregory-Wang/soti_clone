import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage.js';

// Log level enumeration
const LogLevel = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    SUCCESS: 'success'
};

// Log type enumeration
const LogType = {
    MQTT_CONNECT: 'mqtt_connect',
    MQTT_MESSAGE: 'mqtt_message',
    MQTT_ERROR: 'mqtt_error',
    SYSTEM_ERROR: 'system_error',
    HEARTBEAT: 'heartbeat',
    DEVICE_STATUS: 'device_status'
};

// Global log manager
class LogManager {
    constructor() {
        this.listeners = [];
        this.logs = [];
        this.maxLogs = 1000; // Maximum log count
    }

    // Add log
    addLog(level, type, message, data = null) {
        const log = {
            id: Date.now() + Math.random(),
            timestamp: new Date(),
            level,
            type,
            message,
            data
        };

        this.logs.push(log);

        // Limit log count
        if (this.logs.length > this.maxLogs) {
            this.logs = this.logs.slice(-this.maxLogs);
        }

        // Notify all listeners
        this.listeners.forEach(listener => listener(log));

        // Also output to console
        const consoleMethod = level === 'error' ? 'error' : 
                             level === 'warning' ? 'warn' : 
                             level === 'success' ? 'log' : 'info';
        console[consoleMethod](`[${type.toUpperCase()}] ${message}`, data);
    }

    // Add info log
    info(type, message, data) {
        this.addLog(LogLevel.INFO, type, message, data);
    }

    // Add warning log
    warning(type, message, data) {
        this.addLog(LogLevel.WARNING, type, message, data);
    }

    // Add error log
    error(type, message, data) {
        this.addLog(LogLevel.ERROR, type, message, data);
    }

    // Add success log
    success(type, message, data) {
        this.addLog(LogLevel.SUCCESS, type, message, data);
    }

    // Subscribe to log updates
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Get all logs
    getLogs() {
        return [...this.logs];
    }

    // Clear logs
    clearLogs() {
        this.logs = [];
        this.listeners.forEach(listener => listener(null)); // Notify clear
    }

    // Get logs by type
    getLogsByType(type) {
        return this.logs.filter(log => log.type === type);
    }

    // Get logs by level
    getLogsByLevel(level) {
        return this.logs.filter(log => log.level === level);
    }
}

// Create global log manager instance
export const logManager = new LogManager();

const MqttLogWindow = () => {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [autoScroll, setAutoScroll] = useState(true);
    const [width, setWidth] = useState(400); // Default width
    const [isResizing, setIsResizing] = useState(false);
    const logContainerRef = useRef(null);
    const resizeRef = useRef(null);

    // Subscribe to log updates
    useEffect(() => {
        const unsubscribe = logManager.subscribe((log) => {
            if (log === null) {
                setLogs([]);
            } else {
                setLogs(prevLogs => [...prevLogs, log]);
            }
        });

        // Initialize logs
        setLogs(logManager.getLogs());

        return unsubscribe;
    }, []);

    // Auto scroll
    useEffect(() => {
        if (autoScroll && logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs, autoScroll]);

    // Handle width adjustment
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isResizing) {
                const newWidth = window.innerWidth - e.clientX;
                if (newWidth >= 300 && newWidth <= 800) {
                    setWidth(newWidth);
                }
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const getLogLevelStyle = (level) => {
        switch (level) {
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    const getLogTypeIcon = (type) => {
        switch (type) {
            case 'mqtt_connect':
                return 'fas fa-wifi';
            case 'mqtt_message':
                return 'fas fa-comment';
            case 'mqtt_error':
                return 'fas fa-exclamation-triangle';
            case 'system_error':
                return 'fas fa-bug';
            case 'heartbeat':
                return 'fas fa-heartbeat';
            case 'device_status':
                return 'fas fa-print';
            default:
                return 'fas fa-info-circle';
        }
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        if (filter === 'mqtt') return log.type.includes('mqtt');
        if (filter === 'system') return log.type === 'system_error';
        if (filter === 'error') return log.level === 'error';
        return true;
    });

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const handleClearLogs = () => {
        logManager.clearLogs();
    };

    const handleExportLogs = () => {
        const logText = filteredLogs.map(log => 
            `[${formatTime(log.timestamp)}] [${log.level.toUpperCase()}] [${log.type.toUpperCase()}] ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `mqtt-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all duration-300 ${
                    isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
                title={isOpen ? t('closeLogWindow') : t('openLogWindow')}
            >
                <i className={`fas ${isOpen ? 'fa-times' : 'fa-terminal'} text-lg`}></i>
                {logs.filter(log => log.level === 'error').length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {logs.filter(log => log.level === 'error').length}
                    </span>
                )}
            </button>

            {/* Sidebar log window */}
            {isOpen && (
                <div 
                    className="fixed top-0 right-0 h-full bg-white shadow-2xl border-l border-gray-200 z-40 flex flex-col"
                    style={{ width: `${width}px` }}
                >
                    {/* Drag to resize handle */}
                    <div
                        ref={resizeRef}
                        className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-gray-300 hover:bg-blue-500 transition-colors"
                        onMouseDown={() => setIsResizing(true)}
                        title={t('dragToResize')}
                    >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-gray-400 rounded-full"></div>
                    </div>

                    {/* Title bar */}
                    <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center">
                            <i className="fas fa-terminal text-blue-600 mr-2"></i>
                            <h3 className="text-sm font-semibold text-gray-800">{t('mqttLogMonitor')}</h3>
                            <span className="ml-2 text-xs text-gray-500">({filteredLogs.length})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => setAutoScroll(!autoScroll)}
                                className={`p-1 rounded text-xs ${autoScroll ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                                title={autoScroll ? t('closeAutoScroll') : t('enableAutoScroll')}
                            >
                                <i className="fas fa-arrow-down"></i>
                            </button>
                            <button
                                onClick={handleExportLogs}
                                className="p-1 rounded text-xs bg-green-100 text-green-600 hover:bg-green-200"
                                title={t('exportLogs')}
                            >
                                <i className="fas fa-download"></i>
                            </button>
                            <button
                                onClick={handleClearLogs}
                                className="p-1 rounded text-xs bg-red-100 text-red-600 hover:bg-red-200"
                                title={t('clearLogs')}
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                        >
                            <option value="all">{t('allLogs')}</option>
                            <option value="mqtt">{t('mqttRelated')}</option>
                            <option value="system">{t('systemErrors')}</option>
                            <option value="error">{t('errorsOnly')}</option>
                        </select>
                    </div>

                    {/* Log content */}
                    <div 
                        ref={logContainerRef}
                        className="flex-1 overflow-y-auto p-2 space-y-1 bg-gray-50"
                    >
                        {filteredLogs.length === 0 ? (
                            <div className="text-center text-gray-500 text-sm py-8">
                                <i className="fas fa-inbox text-2xl mb-2"></i>
                                <p>No logs yet</p>
                            </div>
                        ) : (
                            filteredLogs.map(log => (
                                <div
                                    key={log.id}
                                    className={`text-xs p-2 rounded border ${getLogLevelStyle(log.level)}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center flex-1">
                                            <i className={`${getLogTypeIcon(log.type)} mr-1`}></i>
                                            <span className="font-mono">{formatTime(log.timestamp)}</span>
                                            <span className="mx-1">•</span>
                                            <span className="font-medium">{log.message}</span>
                                        </div>
                                    </div>
                                    {log.data && (
                                        <div className="mt-1 text-xs opacity-75">
                                            <pre className="whitespace-pre-wrap break-words">
                                                {typeof log.data === 'object' ? JSON.stringify(log.data, null, 2) : log.data}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default MqttLogWindow; 