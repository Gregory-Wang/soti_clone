import React from 'react'

const VisualBoard = () => {
  return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">可视化设计工具</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <div className="bg-gray-50 rounded-lg p-6 min-h-96">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">设计画布</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                                    <div className="text-center text-gray-500">
                                        <i className="fas fa-chart-pie text-3xl mb-2"></i>
                                        <p>拖拽图表组件到这里</p>
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                                    <div className="text-center text-gray-500">
                                        <i className="fas fa-chart-bar text-3xl mb-2"></i>
                                        <p>拖拽图表组件到这里</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">组件库</h3>
                        <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                                <i className="fas fa-chart-pie text-blue-500 mr-2"></i>
                                <span className="text-sm">饼状图</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                                <i className="fas fa-chart-bar text-green-500 mr-2"></i>
                                <span className="text-sm">柱状图</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                                <i className="fas fa-chart-line text-purple-500 mr-2"></i>
                                <span className="text-sm">折线图</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-shadow">
                                <i className="fas fa-tachometer-alt text-orange-500 mr-2"></i>
                                <span className="text-sm">仪表盘</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VisualBoard