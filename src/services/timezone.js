// Timezone management service
class TimezoneService {
    constructor() {
        // Default timezone: Beijing time (UTC+8)
        this.timezone = this.getStoredTimezone() || 'Asia/Shanghai';
        this.timezoneOffset = 8; // Default UTC+8
    }

    // Get stored timezone (compatible with Node.js environment)
    getStoredTimezone() {
        try {
            if (typeof localStorage !== 'undefined') {
                return localStorage.getItem('timezone');
            }
        } catch (error) {
            console.warn('localStorage not available, using default timezone');
        }
        return null;
    }

    // Store timezone (compatible with Node.js environment)
    storeTimezone(timezone) {
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('timezone', timezone);
            }
        } catch (error) {
            console.warn('localStorage not available, cannot save timezone settings');
        }
    }

    // Get current timezone
    getTimezone() {
        return this.timezone;
    }

    // Set timezone
    setTimezone(timezone) {
        this.timezone = timezone;
        this.storeTimezone(timezone);
        
        // Update timezone offset
        this.updateTimezoneOffset();
    }

    // Update timezone offset
    updateTimezoneOffset() {
        try {
            const date = new Date();
            const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
            const targetTime = new Date(utc + (this.getTimezoneOffset() * 60000));
            this.timezoneOffset = targetTime.getTimezoneOffset() / -60;
        } catch (error) {
            console.error('Failed to update timezone offset:', error);
            // Use default offset
            this.timezoneOffset = 8;
        }
    }

    // Get timezone offset (hours)
    getTimezoneOffset() {
        return this.timezoneOffset;
    }

    // Format time - fix UTC timestamp processing
    formatDateTime(dateString, options = {}) {
        if (!dateString) return 'Unknown';
        
        try {
            let date;
            
            // Handle UTC timestamp strings (e.g., "2025-07-30T09:41:37.019Z")
            if (typeof dateString === 'string' && dateString.includes('T') && dateString.includes('Z')) {
                // This is a UTC timestamp, parse directly
                date = new Date(dateString);
            } else {
                // Other time formats
                date = new Date(dateString);
            }
            
            // Default options
            const defaultOptions = {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: this.timezone,
                hour12: false
            };

            const finalOptions = { ...defaultOptions, ...options };
            
            return date.toLocaleString('zh-CN', finalOptions);
        } catch (error) {
            console.error('Failed to format time:', error);
            return 'Time format error';
        }
    }

    // Format date
    formatDate(dateString) {
        return this.formatDateTime(dateString, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    // Format time
    formatTime(dateString) {
        return this.formatDateTime(dateString, {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    // Get available timezone list
    getAvailableTimezones() {
        return [
            { value: 'Asia/Shanghai', label: 'Beijing Time (UTC+8)', offset: 8 },
            { value: 'Asia/Tokyo', label: 'Tokyo Time (UTC+9)', offset: 9 },
            { value: 'Asia/Seoul', label: 'Seoul Time (UTC+9)', offset: 9 },
            { value: 'Asia/Singapore', label: 'Singapore Time (UTC+8)', offset: 8 },
            { value: 'Asia/Hong_Kong', label: 'Hong Kong Time (UTC+8)', offset: 8 },
            { value: 'Asia/Taipei', label: 'Taipei Time (UTC+8)', offset: 8 },
            { value: 'America/New_York', label: 'New York Time (UTC-5)', offset: -5 },
            { value: 'America/Los_Angeles', label: 'Los Angeles Time (UTC-8)', offset: -8 },
            { value: 'Europe/London', label: 'London Time (UTC+0)', offset: 0 },
            { value: 'Europe/Paris', label: 'Paris Time (UTC+1)', offset: 1 },
            { value: 'Europe/Berlin', label: 'Berlin Time (UTC+1)', offset: 1 },
            { value: 'UTC', label: 'Coordinated Universal Time (UTC+0)', offset: 0 }
        ];
    }

    // Get current timezone information
    getCurrentTimezoneInfo() {
        const timezones = this.getAvailableTimezones();
        return timezones.find(tz => tz.value === this.timezone) || timezones[0];
    }
}

// Create singleton instance
const timezoneService = new TimezoneService();

export default timezoneService; 