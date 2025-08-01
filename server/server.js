import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database initialization
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        initDatabase();
    }
});

// Initialize database tables
function initDatabase() {
    // Printer table
    const createPrintersTableSQL = `
        CREATE TABLE IF NOT EXISTS printers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            client_id TEXT NOT NULL UNIQUE,
            device_sn TEXT,
            status INTEGER DEFAULT 1,
            firmware_version TEXT,
            last_heartbeat DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // MQTT config table
    const createMqttConfigTableSQL = `
        CREATE TABLE IF NOT EXISTS mqtt_config (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            broker_url TEXT NOT NULL,
            port INTEGER DEFAULT 8083,
            protocol TEXT DEFAULT 'ws',
            username TEXT DEFAULT 'emqx_test',
            password TEXT DEFAULT 'emqx_test',
            heartbeat_topic TEXT DEFAULT 'printer/{client_id}/heartbeat',
            task_status_topic TEXT DEFAULT 'printer/{client_id}/task_status',
            command_topic TEXT DEFAULT 'printer/{client_id}/command',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    // Performance data table
    const createPerformanceDataTableSQL = `
        CREATE TABLE IF NOT EXISTS performance_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            online_rate REAL,
            response_time REAL,
            error_rate REAL,
            throughput REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.serialize(() => {
        // Create printer table
        db.run(createPrintersTableSQL, (err) => {
            if (err) {
                console.error('Failed to create printers table:', err.message);
            }
        });

        // Create MQTT config table
        db.run(createMqttConfigTableSQL, (err) => {
            if (err) {
                console.error('Failed to create mqtt_config table:', err.message);
            } else {
                // Insert default MQTT config
                db.get('SELECT * FROM mqtt_config LIMIT 1', (err, row) => {
                    if (err) {
                        console.error('Failed to query mqtt_config:', err.message);
                    } else if (!row) {
                        const insertDefaultConfigSQL = `
                            INSERT INTO mqtt_config (broker_url, port, protocol, username, password, heartbeat_topic, task_status_topic, command_topic)
                            VALUES ('broker.emqx.io', 8083, 'ws', 'emqx_test', 'emqx_test', '/{client_id}/XP421B/user/printer/heartbeat', '/{client_id}/XP421B/user/printer/task_status', '/{client_id}/XP421B/user/printer/command')
                        `;
                        db.run(insertDefaultConfigSQL, (err) => {
                            if (err) {
                                console.error('Failed to insert default mqtt config:', err.message);
                            }
                        });
                    }
                });
            }
        });

        // Create performance data table
        db.run(createPerformanceDataTableSQL, (err) => {
            if (err) {
                console.error('Failed to create performance_data table:', err.message);
            }
        });
    });
}

// API routes

// Get all printers
app.get('/api/printers', (req, res) => {
    const sql = 'SELECT * FROM printers ORDER BY created_at DESC';
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            success: true,
            data: rows
        });
    });
});

// Add printer
app.post('/api/printers', (req, res) => {
    const { name, client_id } = req.body;
    
    if (!name || !client_id) {
        return res.status(400).json({
            success: false,
            error: 'Printer name and serial number are required'
        });
    }

    const sql = 'INSERT INTO printers (name, client_id) VALUES (?, ?)';
    
    db.run(sql, [name, client_id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({
                    success: false,
                    error: 'Serial number already exists, please use a different serial number'
                });
            }
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Printer added successfully',
            data: {
                id: this.lastID,
                name,
                client_id,
                status: 'offline',
                created_at: new Date().toISOString()
            }
        });
    });
});

// Update printer status
app.put('/api/printers/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const sql = 'UPDATE printers SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.run(sql, [status, id], function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Printer not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Status updated successfully'
        });
    });
});

// Update printer basic info
app.put('/api/printers/:id', (req, res) => {
    const { id } = req.params;
    const { name, client_id } = req.body;
    
    if (!name || !client_id) {
        return res.status(400).json({
            success: false,
            error: 'Printer name and serial number are required'
        });
    }
    
    const sql = 'UPDATE printers SET name = ?, client_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    
    db.run(sql, [name, client_id, id], function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Printer not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Printer info updated successfully',
            data: {
                id: parseInt(id),
                name,
                client_id,
                updated_at: new Date().toISOString()
            }
        });
    });
});

// Update printer heartbeat time
app.put('/api/printers/:id/heartbeat', (req, res) => {
    const { id } = req.params;
    const { status, firmware_version, device_sn } = req.body;
    
    // Use UTC timestamp to avoid timezone issues
    const now = new Date().toISOString();
    
    // If device_sn exists, update device_sn field
    let sql, params;
    if (device_sn) {
        sql = 'UPDATE printers SET status = ?, firmware_version = ?, device_sn = ?, last_heartbeat = ?, updated_at = ? WHERE id = ?';
        params = [status, firmware_version, device_sn, now, now, id];
    } else {
        sql = 'UPDATE printers SET status = ?, firmware_version = ?, last_heartbeat = ?, updated_at = ? WHERE id = ?';
        params = [status, firmware_version, now, now, id];
    }
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('Database update failed:', err);
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Printer not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Heartbeat updated successfully'
        });
    });
});

// Delete printer
app.delete('/api/printers/:id', (req, res) => {
    const { id } = req.params;
    
    const sql = 'DELETE FROM printers WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Printer not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Printer deleted successfully'
        });
    });
});

// Get printer statistics
app.get('/api/printers/stats', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as online,
            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as offline,
            SUM(CASE WHEN status IN (2, 3, 100) THEN 1 ELSE 0 END) as warning
        FROM printers
    `;
    
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            success: true,
            data: row
        });
    });
});

// MQTT config related API

// Get MQTT config
app.get('/api/mqtt/config', (req, res) => {
    const sql = 'SELECT * FROM mqtt_config ORDER BY id DESC LIMIT 1';
    
    db.get(sql, [], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            success: true,
            data: row
        });
    });
});

// Update MQTT config
app.put('/api/mqtt/config', (req, res) => {
    const { broker_url, port, protocol, username, password, heartbeat_topic, task_status_topic, command_topic } = req.body;
    
    if (!broker_url) {
        return res.status(400).json({
            success: false,
            error: 'MQTT server address is required'
        });
    }

    const sql = `
        INSERT OR REPLACE INTO mqtt_config (id, broker_url, port, protocol, username, password, heartbeat_topic, task_status_topic, command_topic, updated_at)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [broker_url, port || 8083, protocol || 'ws', username || 'emqx_test', password || 'emqx_test', heartbeat_topic || 'printer/{client_id}/heartbeat', task_status_topic || 'printer/{client_id}/task_status', command_topic || 'printer/{client_id}/command'], function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'MQTT config updated successfully'
        });
    });
});

// Performance data related API

// Get performance data
app.get('/api/performance/data', (req, res) => {
    const sql = `
        SELECT 
            online_rate,
            response_time,
            error_rate,
            throughput,
            timestamp
        FROM performance_data 
        ORDER BY timestamp DESC 
        LIMIT 24
    `;
    
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        // Convert data to frontend expected format
        const performanceData = {
            onlineRate: rows.map(row => ({
                value: row.online_rate,
                timestamp: row.timestamp
            })),
            responseTime: rows.map(row => ({
                value: row.response_time,
                timestamp: row.timestamp
            })),
            errorRate: rows.map(row => ({
                value: row.error_rate,
                timestamp: row.timestamp
            })),
            throughput: rows.map(row => ({
                value: row.throughput,
                timestamp: row.timestamp
            }))
        };
        
        res.json({
            success: true,
            data: performanceData
        });
    });
});

// Save performance data
app.post('/api/performance/data', (req, res) => {
    const { onlineRate, responseTime, errorRate, throughput } = req.body;
    
    if (!onlineRate || !responseTime || !errorRate || !throughput) {
        return res.status(400).json({
            success: false,
            error: 'Missing required performance data fields'
        });
    }

    const sql = `
        INSERT INTO performance_data (online_rate, response_time, error_rate, throughput, timestamp)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    db.run(sql, [onlineRate, responseTime, errorRate, throughput], function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Performance data saved successfully'
        });
    });
});

// Get performance statistics
app.get('/api/performance/stats', (req, res) => {
    const sql = `
        SELECT 
            AVG(online_rate) as avg_online_rate,
            AVG(response_time) as avg_response_time,
            AVG(error_rate) as avg_error_rate,
            AVG(throughput) as avg_throughput,
            MAX(online_rate) as max_online_rate,
            MIN(response_time) as min_response_time,
            COUNT(*) as total_records
        FROM performance_data 
        WHERE timestamp >= datetime('now', '-24 hours')
    `;
    
    db.get(sql, [], (err, row) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            data: row
        });
    });
});

// Delete all performance data
app.delete('/api/performance/data', (req, res) => {
    const sql = 'DELETE FROM performance_data';
    
    db.run(sql, [], function(err) {
        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }
        
        res.json({
            success: true,
            message: 'Performance data cleared'
        });
    });
});

// Start server
app.listen(PORT, () => {
    
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        }
        process.exit(0);
    });
}); 