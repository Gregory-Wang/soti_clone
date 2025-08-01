import React, { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import DeviceList from "@/components/ui/DeviceList.jsx";
import DeviceDetail from "@/components/ui/DeviceDetail.jsx";
import { useModal, ModalTrigger } from "@/components/ui/ModalManager.jsx";
import { useLanguage } from '@/hooks/useLanguage.js';

const DeviceManagement = React.memo(() => {
    const { t } = useLanguage();
    const { registerRefreshCallback } = useModal();
    const deviceListRef = useRef(null);
    const [selectedDevice, setSelectedDevice] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Create a stable refresh function reference
    const refreshFunction = useCallback(() => {
        if (deviceListRef.current) {
            return deviceListRef.current();
        }
    }, []);

    // Register refresh callback - only register once when component mounts
    useEffect(() => {
        registerRefreshCallback(refreshFunction);
    }, [registerRefreshCallback, refreshFunction]);

    const handleAddDevice = useCallback(() => {
        // This feature is now handled by ModalTrigger
    }, []);

    const handleSyncDevices = useCallback(() => {
        // Refresh device list
        if (deviceListRef.current) {
            deviceListRef.current();
        }
    }, []);   

    // Handle device selection
    const handleDeviceSelect = useCallback((device) => {
        setIsTransitioning(true);
        
        // Use setTimeout to ensure fadeout animation completes before switching page
        setTimeout(() => {
            setSelectedDevice(device);
            setIsTransitioning(false);
        }, 300); // 300ms is the duration of the CSS transition
    }, []);

    // Handle return to device list
    const handleBackToList = useCallback(() => {
        setIsTransitioning(true);
        
        // Use setTimeout to ensure fadeout animation completes before switching page
        setTimeout(() => {
            setSelectedDevice(null);
            setIsTransitioning(false);
        }, 300);
    }, []);

    // Use useMemo to optimize button rendering
    const actionButtons = useMemo(() => (
        <div className="flex space-x-3">
            <ModalTrigger modalType="addPrinter">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                    <i className="fas fa-plus mr-2"></i>{t('addDevice')}
                </button>
            </ModalTrigger>
            <button 
                onClick={handleSyncDevices}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
                <i className="fas fa-sync mr-2"></i>{t('syncDevices')}
            </button>
        </div>
    ), [handleSyncDevices, t]);

    return (
        <div className="space-y-6">
            {/* Page title and action buttons - only shown on device list page */}
            {!selectedDevice && (
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{t('deviceManagement')}</h1>
                            <p className="text-gray-600 mt-1">{t('deviceManagementDescription')}</p>
                        </div>
                        {actionButtons}
                    </div>
                </div>
            )}

            {/* Content area */}
            <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                {selectedDevice ? (
                    <DeviceDetail 
                        device={selectedDevice} 
                        onBack={handleBackToList}
                    />
                ) : (
                    <DeviceList 
                        onRefresh={(refreshFunction) => {
                            deviceListRef.current = refreshFunction;
                        }}
                        onDeviceSelect={handleDeviceSelect}
                    />
                )}
            </div>
        </div>
    );
});

DeviceManagement.displayName = 'DeviceManagement';

export default DeviceManagement