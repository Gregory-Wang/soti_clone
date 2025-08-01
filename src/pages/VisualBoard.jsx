import React from 'react'
import { useLanguage } from '@/hooks/useLanguage.js';

const VisualBoard = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{t('visualDesignTool')}</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-lg p-6 min-h-96">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('designCanvas')}</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                                    <div className="text-center text-gray-500">
                                        <i className="fas fa-chart-pie text-3xl mb-2"></i>
                                        <p>{t('dragChartComponentHere')}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                                    <div className="text-center text-gray-500">
                                        <i className="fas fa-chart-bar text-3xl mb-2"></i>
                                        <p>{t('dragChartComponentHere')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">{t('componentLibrary')}</h3>
                        <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                                <i className="fas fa-chart-pie text-blue-500 mr-2"></i>
                                <span className="text-sm">{t('pieChart')}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                                <i className="fas fa-chart-bar text-green-500 mr-2"></i>
                                <span className="text-sm">{t('barChart')}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                                <i className="fas fa-chart-line text-purple-500 mr-2"></i>
                                <span className="text-sm">{t('lineChart')}</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                                <i className="fas fa-tachometer-alt text-orange-500 mr-2"></i>
                                <span className="text-sm">{t('gauge')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VisualBoard