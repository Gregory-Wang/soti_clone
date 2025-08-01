import React from 'react';
import { useModal, ModalTrigger } from './ModalManager.jsx';

/**
 * Global Modal system usage examples
 * Demonstrates how to use Modal in different components
 */

// Example 1: Used in dashboard
export const DashboardAddPrinter = () => {
    const { openModal } = useModal();

    const handleQuickAdd = () => {
        openModal('addPrinter', {
            // Custom configuration
            resultConfig: {
                success: {
                    type: 'success',
                    icon: 'fa-check',
                    title: 'Quick add success',
                    message: 'Printer has been added to quick device list'
                }
            }
        });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Operations</h3>
            <div className="space-y-2">
                <ModalTrigger modalType="addPrinter">
                    <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                        <i className="fas fa-plus mr-2"></i>Add Printer
                    </button>
                </ModalTrigger>
                
                <button 
                    onClick={handleQuickAdd}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                >
                    <i className="fas fa-bolt mr-2"></i>Quick Add
                </button>
            </div>
        </div>
    );
};

// Example 2: Used in toolbar
export const ToolbarAddPrinter = () => {
    return (
        <div className="flex items-center space-x-2">
            <ModalTrigger modalType="addPrinter">
                <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                    <i className="fas fa-plus mr-1"></i>Add
                </button>
            </ModalTrigger>
            
            <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors">
                <i className="fas fa-download mr-1"></i>Import
            </button>
        </div>
    );
};

// Example 3: Used in device list
export const DeviceListAddPrinter = () => {
    const { openModal } = useModal();

    const handleAddWithPreset = () => {
        openModal('addPrinter', {
            formConfig: {
                fields: [
                    {
                        name: 'printerName',
                        label: 'Printer Name',
                        type: 'text',
                        required: true,
                        errorMessage: 'Please enter printer name',
                        defaultValue: 'HP LaserJet'
                    },
                    {
                        name: 'printerId',
                        label: 'Device ID',
                        type: 'text',
                        required: true,
                        errorMessage: 'Please enter device ID',
                        defaultValue: 'HP001'
                    }
                ],
                validation: true
            }
        });
    };

    return (
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                        <h3 className="text-lg font-semibold">Device List</h3>
            <div className="flex space-x-2">
                <ModalTrigger modalType="addPrinter">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                        <i className="fas fa-plus mr-2"></i>Add Device
                    </button>
                </ModalTrigger>
                
                <button 
                    onClick={handleAddWithPreset}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                >
                    <i className="fas fa-magic mr-2"></i>Quick Add
                </button>
            </div>
        </div>
    );
};

// Example 4: Used in settings page
export const SettingsAddPrinter = () => {
    const { openModal } = useModal();

    const handleAdvancedAdd = () => {
        openModal('addPrinter', {
            formConfig: {
                fields: [
                    {
                        name: 'printerName',
                        label: 'Printer Name',
                        type: 'text',
                        required: true,
                        errorMessage: 'Please enter printer name'
                    },
                    {
                        name: 'printerId',
                        label: 'Device ID',
                        type: 'text',
                        required: true,
                        errorMessage: 'Please enter device ID'
                    },
                    {
                        name: 'location',
                        label: 'Location',
                        type: 'text',
                        required: false,
                        placeholder: 'e.g., Office Area A'
                    }
                ],
                validation: true
            },
            resultConfig: {
                success: {
                    type: 'success',
                    icon: 'fa-check',
                    title: 'Advanced configuration successful',
                    message: 'Printer has been added to system and advanced configuration completed'
                },
                duration: 3000
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Printer Configuration</h3>
            <div className="space-y-4">
                <ModalTrigger modalType="addPrinter">
                    <button className="w-full bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 transition-colors">
                        <i className="fas fa-plus mr-2"></i>Add Printer
                    </button>
                </ModalTrigger>
                
                <button 
                    onClick={handleAdvancedAdd}
                    className="w-full bg-purple-600 text-white px-4 py-3 rounded hover:bg-purple-700 transition-colors"
                >
                    <i className="fas fa-cog mr-2"></i>Advanced Configuration
                </button>
            </div>
        </div>
    );
}; 

// Example 5: Quick add (no success prompt)
export const QuickAddPrinter = () => {
    const { openModal } = useModal();

    const handleQuickAdd = () => {
        openModal('addPrinter', {
            // Don't configure resultConfig, this will close immediately
            formConfig: {
                fields: [
                    {
                        name: 'printerName',
                        label: 'Printer Name',
                        type: 'text',
                        required: true,
                        errorMessage: 'Please enter printer name'
                    },
                    {
                        name: 'printerId',
                        label: 'Device ID',
                        type: 'text',
                        required: true,
                        errorMessage: 'Please enter device ID'
                    }
                ],
                validation: true
            }
            // Don't set resultConfig, will close immediately
        });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Quick Operations</h3>
            <button 
                onClick={handleQuickAdd}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            >
                <i className="fas fa-bolt mr-2"></i>Quick Add (No Prompt)
            </button>
        </div>
    );
}; 