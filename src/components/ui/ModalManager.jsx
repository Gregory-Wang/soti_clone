import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import ModelAddPrinter from './ModelAddPrinter.jsx';
import apiService from '../../services/api.js';
import mqttService from '../../services/mqtt.js';
import { useLanguage } from '@/hooks/useLanguage.js';

// Create Modal context
const ModalContext = createContext();

// Modal manager component
export const ModalManager = ({ children }) => {
    const { t } = useLanguage();
    const [modals, setModals] = useState({
        addPrinter: {
            isOpen: false,
            config: {}
        },
        deleteConfirm: {
            isOpen: false,
            config: {}
        },
        message: {
            isOpen: false,
            config: {}
        }
    });

    const modalRefs = {
        addPrinter: useRef(null),
        deleteConfirm: useRef(null),
        message: useRef(null)
    };

    // Refresh callback functions
    const [refreshCallbacks, setRefreshCallbacks] = useState([]);

    // Register refresh callback - use useCallback for stable reference
    const registerRefreshCallback = useCallback((callback) => {
        setRefreshCallbacks(prev => {
            // Avoid duplicate registration of the same callback
            if (prev.includes(callback)) {
                return prev;
            }
            return [...prev, callback];
        });
    }, []);

    // Trigger all refresh callbacks
    const triggerRefresh = async () => {
        for (const callback of refreshCallbacks) {
            try {
                await callback();
            } catch (error) {
                console.error('Refresh callback execution failed:', error);
            }
        }
    };

    // Open Modal
    const openModal = (modalType, config = {}) => {
        setModals(prev => ({
            ...prev,
            [modalType]: {
                isOpen: true,
                config
            }
        }));
    };

    // Close Modal
    const closeModal = (modalType) => {
        setModals(prev => ({
            ...prev,
            [modalType]: {
                isOpen: false,
                config: {}
            }
        }));
    };

    // Add printer to database
    const addPrinter = async (printerName, clientId) => {
        try {
            // Call API service
            const result = await apiService.addPrinter(printerName, clientId);
            
            // Trigger refresh after successful addition
            await triggerRefresh();
            
            // If MQTT service is connected, subscribe to new printer's topic
            if (mqttService.isConnected) {
                const newPrinter = {
                    id: result.data.id,
                    name: printerName,
                    client_id: clientId,
                    status: 'offline'
                };
                await mqttService.addPrinter(newPrinter);
            }
            
            // Emit printer add success event
            mqttService.emit('printerAdded', { printer: result.data });
            
            return { success: true, data: result.data };
        } catch (error) {
            console.error('Failed to add printer:', error);
            // Directly throw error, let modal component display specific error message
            throw error;
        }
    };

    // Delete device
    const deleteDevice = async (deviceId, deviceName) => {
        try {
            // Find printer info to delete
            const printersResponse = await apiService.getPrinters();
            const printers = printersResponse.data || [];
            const printerToDelete = printers.find(p => p.id === deviceId);
            
            // Call API service
            await apiService.deletePrinter(deviceId);
            
            // Trigger refresh after successful deletion
            await triggerRefresh();
            
            // If MQTT service is connected, unsubscribe from deleted printer's topic
            if (mqttService.isConnected && printerToDelete) {
                await mqttService.removePrinter(printerToDelete);
            }
            
            // Emit device delete success event
            mqttService.emit('deviceDeleted', { deviceId, deviceName });
            
            return { success: true };
        } catch (error) {
            console.error('Failed to delete device:', error);
            throw new Error(error.message || 'Failed to delete device');
        }
    };

    const value = {
        openModal,
        closeModal,
        addPrinter,
        deleteDevice,
        registerRefreshCallback
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
            
            {/* Render all Modals */}
            <ModelAddPrinter
                ref={modalRefs.addPrinter}
                isOpen={modals.addPrinter.isOpen}
                onClose={() => closeModal('addPrinter')}
                onAdd={addPrinter}
                customConfig={modals.addPrinter.config}
            />
            
            {/* Delete confirmation Modal */}
            <DeleteConfirmModal
                ref={modalRefs.deleteConfirm}
                isOpen={modals.deleteConfirm.isOpen}
                onClose={() => closeModal('deleteConfirm')}
                onConfirm={deleteDevice}
                config={modals.deleteConfirm.config}
            />
            
            {/* Message prompt Modal */}
            <MessageModal
                ref={modalRefs.message}
                isOpen={modals.message.isOpen}
                onClose={() => closeModal('message')}
                config={modals.message.config}
            />
        </ModalContext.Provider>
    );
};

// Delete confirmation Modal component
const DeleteConfirmModal = React.forwardRef(({ isOpen, onClose, onConfirm, config }, ref) => {
    const { t } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleConfirm = async () => {
        if (!config.deviceId || !config.deviceName) {
            setError(t('deviceInfoIncomplete'));
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await onConfirm(config.deviceId, config.deviceName);
            onClose();
        } catch (err) {
            setError(err.message || t('deleteFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{t('confirmDelete')}</h2>
                    <button 
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-150 w-8 h-8 p-1 rounded-full hover:bg-gray-100" 
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center mr-4">
                            <i className="fas fa-exclamation-triangle text-red-600 text-xl"></i>
                        </div>
                        <div>
                            <p className="text-gray-600">{t('deleteDeviceConfirm').replace('{deviceName}', config.deviceName)}</p>
                            <p className="font-semibold text-gray-900">{config.deviceName}</p>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                    
                    <p className="text-sm text-gray-500">
                        {t('operationCannotBeUndone')}
                    </p>
                </div>
                
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                        {t('cancel')}
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                        {isLoading ? (
                            <>
                                <i className="fas fa-spinner fa-spin mr-2"></i>
                                {t('deleting')}
                            </>
                        ) : (
                            <>
                                <i className="fas fa-trash mr-2"></i>
                                {t('confirmDelete')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

// Message prompt Modal component
const MessageModal = React.forwardRef(({ isOpen, onClose, config }, ref) => {
    const { t } = useLanguage();
    const { title = t('tip'), message = '', type = 'info' } = config;
    
    const getIcon = () => {
        switch (type) {
            case 'success':
                return <i className="fas fa-check-circle text-green-600 text-xl"></i>;
            case 'error':
                return <i className="fas fa-exclamation-circle text-red-600 text-xl"></i>;
            case 'warning':
                return <i className="fas fa-exclamation-triangle text-yellow-600 text-xl"></i>;
            default:
                return <i className="fas fa-info-circle text-blue-600 text-xl"></i>;
        }
    };
    
    const getBgColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100';
            case 'error':
                return 'bg-red-100';
            case 'warning':
                return 'bg-yellow-100';
            default:
                return 'bg-blue-100';
        }
    };
    
    const getButtonColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-600 hover:bg-green-700';
            case 'error':
                return 'bg-red-600 hover:bg-red-700';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700';
            default:
                return 'bg-blue-600 hover:bg-blue-700';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button 
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-150 w-8 h-8 p-1 rounded-full hover:bg-gray-100" 
                        onClick={onClose}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                
                <div className="mb-6">
                    <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 rounded-lg ${getBgColor()} flex items-center justify-center mr-4`}>
                            {getIcon()}
                        </div>
                        <div>
                            <p className="text-gray-700">{message}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-white rounded-lg transition-colors ${getButtonColor()}`}
                    >
                        {t('confirm')}
                    </button>
                </div>
            </div>
        </div>
    );
});

// Use Modal Hook
export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalManager');
    }
    return context;
};

// Convenient Modal call component
export const ModalTrigger = ({ modalType, config = {}, children, className = "" }) => {
    const { openModal } = useModal();

    const handleClick = () => {
        openModal(modalType, config);
    };

    return (
        <div onClick={handleClick} className={className}>
            {children}
        </div>
    );
}; 