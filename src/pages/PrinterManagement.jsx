import React from 'react'
import mockData from "@/utils/mockData.js";
import { useLanguage } from '@/hooks/useLanguage.js';

const PrinterManagement = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('printerManagement')}</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{t('totalPrinters')}</h3>
                                <p className="text-3xl font-bold">{mockData.stats.printers}</p>
                            </div>
                            <i className="fas fa-print text-4xl opacity-80"></i>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{t('normalOperation')}</h3>
                                <p className="text-3xl font-bold">85</p>
                            </div>
                            <i className="fas fa-check-circle text-4xl opacity-80"></i>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">{t('needMaintenance')}</h3>
                                <p className="text-3xl font-bold">4</p>
                            </div>
                            <i className="fas fa-tools text-4xl opacity-80"></i>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('printerFunctions')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <i className="fas fa-cog text-blue-500 text-2xl mb-2"></i>
                            <h4 className="font-medium text-gray-800">{t('remoteConfiguration')}</h4>
                            <p className="text-sm text-gray-600">{t('remoteConfigurationDescription')}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <i className="fas fa-download text-green-500 text-2xl mb-2"></i>
                            <h4 className="font-medium text-gray-800">{t('firmwareUpdate')}</h4>
                            <p className="text-sm text-gray-600">{t('firmwareUpdateDescription')}</p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200">
                            <i className="fas fa-shield-alt text-red-500 text-2xl mb-2"></i>
                            <h4 className="font-medium text-gray-800">{t('securityManagement')}</h4>
                            <p className="text-sm text-gray-600">{t('securityManagementDescription')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PrinterManagement