import React, { useState, useEffect } from 'react';
import { useModal } from '@/components/ui/ModalManager.jsx';
import timezoneService from '@/services/timezone.js';
import apiService from '@/services/api.js';
import TSPL from '@/utils/TSPL.js';
import mqttService from '@/services/mqtt.js';
import { useLanguage } from '@/hooks/useLanguage.js';

const DeviceDetail = ({ device, onBack }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [currentDevice, setCurrentDevice] = useState(device);
    const [editForm, setEditForm] = useState({
        name: device?.name || '',
        client_id: device?.client_id || ''
    });
    const { openModal } = useModal();
    
    // Listen for MQTT heartbeat update events and device delete events
    // If it is a heartbeat update for the current device, update device info
    // Update device info
    // Also update basic info in the edit form
    // If the deleted device is the current device, return to device list
    // Register event listeners
    // Clean up listeners
    useEffect(() => {
        const handleHeartbeatUpdate = (data) => {
            if (data.error) {
                console.error('Heartbeat update failed:', data.error);
                return;
            }
            
            // If it is a heartbeat update for the current device, update device info
            if (data.printerId === currentDevice.id) {
                // Update device info
                setCurrentDevice(prevDevice => ({
                    ...prevDevice,
                    status: data.status,
                    device_sn: data.deviceSn,
                    firmware_version: data.firmwareVersion,
                    last_heartbeat: data.timestamp
                }));
                
                // Also update basic info in the edit form
                setEditForm(prev => ({
                    ...prev,
                    name: prev.name,
                    client_id: prev.client_id
                }));
            }
        };
        
        const handleDeviceDeleted = (data) => {
            // If the deleted device is the current device, return to device list
            if (data.deviceId === currentDevice.id) {
                onBack();
            }
        };
        
        // Register event listeners
        mqttService.on('heartbeatUpdate', handleHeartbeatUpdate);
        mqttService.on('deviceDeleted', handleDeviceDeleted);
        
        // Clean up listeners
        return () => {
            mqttService.off('heartbeatUpdate', handleHeartbeatUpdate);
            mqttService.off('deviceDeleted', handleDeviceDeleted);
        };
    }, [currentDevice.id, onBack]);
    
    // Handle toolbar actions
    const handleToolbarAction = (action) => {
        
        switch (action) {
            case 'restart':
                // TODO: Implement restart printer
                alert(t('restartPrinterFeatureNotImplemented'));
                break;
            case 'shutdown':
                // TODO: Implement shutdown printer
                alert(t('shutdownPrinterFeatureNotImplemented'));
                break;
            case 'test':
                // TODO: Implement print self-test page
                TSPL.cmdPrint(TSPL.printCommand.selfTest,currentDevice.client_id);
                openModal('message', {
                    title: t('printSelfTest'),
                    message: `${t('commandSent')}：${TSPL.printCommand.selfTest}`,
                    type: 'success'
                });
                break;
            case 'delete':
                // Use modal system to delete device
                openModal('deleteConfirm', {
                    deviceId: currentDevice.id,
                    deviceName: currentDevice.name
                });
                break;
            default:
                break;
        }
    };

    // Handle edit form changes
    const handleEditChange = (field, value) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Save edit
    const handleSaveEdit = async () => {
        try {
            // Validate form data
            if (!editForm.name.trim()) {
                openModal('message', {
                    title: t('validationFailed'),
                    message: t('deviceNameRequired'),
                    type: 'error'
                });
                return;
            }
            
            if (!editForm.client_id.trim()) {
                openModal('message', {
                    title: t('validationFailed'),
                    message: t('serialNumberRequired'),
                    type: 'error'
                });
                return;
            }
            
            // Call API to update device info
            const response = await apiService.updatePrinter(currentDevice.id, editForm.name, editForm.client_id);
            
            if (response.success) {
                setIsEditing(false);
                
                // Update local device data
                Object.assign(currentDevice, {
                    name: editForm.name,
                    client_id: editForm.client_id,
                    updated_at: response.data.updated_at
                });
                
                openModal('message', {
                    title: t('saveSuccess'),
                    message: t('deviceInfoUpdateSuccess'),
                    type: 'success'
                });
            } else {
                throw new Error(response.error || t('updateFailed'));
            }
        } catch (error) {
            console.error('Failed to save edit:', error);
            openModal('message', {
                title: t('saveFailed'),
                message: t('saveFailed') + ': ' + error.message,
                type: 'error'
            });
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditForm({
            name: currentDevice?.name || '',
            client_id: currentDevice?.client_id || ''
        });
        setIsEditing(false);
    };

    const getStatusText = (status) => {
        if (status !== undefined) {
            switch (status) {
                case 0: return t('online');
                case 1: return t('unknownError');
                case 2: return t('printerOutOfPaper');
                case 3: return t('printerCoverOpen');
                case 4: return t('printerOverheated');
                case 5: return t('printerOutOfRibbon');
                default: return t('unknownStatus');
            }
        }
        return t('unknownStatus');
    };

    const getStatusColor = (status) => {
        if (status !== undefined) {
            switch (status) {
                case 0: return 'bg-green-500';
                case 1: return 'bg-red-500';
                case 2: return 'bg-yellow-500';
                case 3: return 'bg-yellow-500';
                case 4: return 'bg-yellow-500';
                case 5: return 'bg-yellow-500';
                default: return 'bg-gray-500';
            }
        }
        return 'bg-gray-500';
    };

    if (!currentDevice) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500">
                    <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                    <p>{t('noDeviceSelected')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="text-gray-600 hover:text-gray-800 transition-colors"
                            >
                                <i className="fas fa-arrow-left mr-2"></i>
                                {t('back')}
                            </button>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {currentDevice.name} - {t('deviceManagement')}
                            </h2>
                        </div>
                        
                    </div>
                </div>
            </div>

            {/* Work area */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Tab navigation */}
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'overview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-info-circle mr-2"></i>
                            {t('deviceOverview')}
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'settings'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-cog mr-2"></i>
                            {t('deviceSettings')}
                        </button>
                        <button
                            onClick={() => setActiveTab('test')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                activeTab === 'test'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <i className="fas fa-vial mr-2"></i>
                            {t('deviceTest')}
                        </button>
                    </nav>
                </div>

                {/* Tab content */}
                <div className="p-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">{t('deviceInformation')}</h3>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <i className="fas fa-edit mr-2"></i>
                                    {isEditing ? t('cancelEdit') : t('edit')}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('deviceName')}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => handleEditChange('name', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-900">{currentDevice.name}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('clientId')}
                                        </label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={editForm.client_id}
                                                onChange={(e) => handleEditChange('client_id', e.target.value)}
                                                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        ) : (
                                            <div className="text-sm text-gray-900">{currentDevice.client_id}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('deviceId')}
                                        </label>
                                        <div className="text-sm text-gray-900">{currentDevice.id}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('deviceSerialNumber')}
                                        </label>
                                        <div className="text-sm text-gray-900">{currentDevice.device_sn || t('unknown')}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('status')}
                                        </label>
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(currentDevice.status)}`}></div>
                                            <span className="text-sm text-gray-900">{getStatusText(currentDevice.status)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Detailed info */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('firmwareVersion')}
                                        </label>
                                        <div className="text-sm text-gray-900">{currentDevice.firmware_version || t('unknown')}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('lastHeartbeat')}
                                        </label>
                                        <div className="text-sm text-gray-900">
                                            {currentDevice.last_heartbeat ? timezoneService.formatDateTime(currentDevice.last_heartbeat) : t('neverConnected')}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('createdAt')}
                                        </label>
                                        <div className="text-sm text-gray-900">{timezoneService.formatDateTime(currentDevice.created_at)}</div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {t('updatedAt')}
                                        </label>
                                        <div className="text-sm text-gray-900">{timezoneService.formatDateTime(currentDevice.updated_at)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Edit action buttons */}
                            {isEditing && (
                                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={handleSaveEdit}
                                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <i className="fas fa-save mr-2"></i>
                                        {t('save')}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <i className="fas fa-times mr-2"></i>
                                        {t('cancel')}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">{t('deviceSettings')}</h3>
                            <div className="text-left text-gray-500 py-8">
                                <button
                                        onClick={() => handleToolbarAction('delete')}
                                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                        title={t('deletePrinterTitle')}
                                    >
                                        <i className="fas fa-trash mr-2"></i>
                                        {t('deletePrinter')}
                                    </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'test' && (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium text-gray-900">{t('deviceTest')}</h3>
                            <div className="text-center text-gray-500 py-8">
                            <div className="flex items-center space-x-2">
                                {/* <button
                                    onClick={() => handleToolbarAction('restart')}
                                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                    title={t('restartPrinterTitle')}
                                >
                                    <i className="fas fa-redo mr-2"></i>
                                    {t('restartPrinter')}
                                </button>
                                <button
                                    onClick={() => handleToolbarAction('shutdown')}
                                    className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                                    title={t('shutdownPrinterTitle')}
                                >
                                    <i className="fas fa-power-off mr-2"></i>
                                    {t('shutdownPrinter')}
                                </button> */}
                                <button
                                    onClick={() => handleToolbarAction('test')}
                                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                    title={t('printSelfTestTitle')}
                                >
                                    <i className="fas fa-print mr-2"></i>
                                    {t('printSelfTest')}
                                </button>
                                
                            </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DeviceDetail; 