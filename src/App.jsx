import React, { useEffect } from 'react';
import Sidebar from "@/components/layout/Sidebar";
import TopNavigation from "@/components/layout/TopNavigation";
import ContentRenderer from "@/components/layout/ContentRenderer";
import { ModalManager } from "@/components/ui/ModalManager.jsx";
import MqttLogWindow from "@/components/ui/MqttLogWindow.jsx";
import { useState } from "react";
import mqttService from "@/services/mqtt.js";
import performanceService from "@/services/performance.js";

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Initialize MQTT service when app starts
  useEffect(() => {
    const initServices = async () => {
      try {
        await mqttService.init();
        await performanceService.init();
      } catch (error) {
        console.error('Service initialization failed:', error);
      }
    };

    initServices();
  }, []);

  // Function to navigate to settings page
  const navigateToSettings = () => {
    setActiveTab('settings');
  };

  return (
    <ModalManager>
      <div className="flex h-screen w-screen bg-gray-100 overflow-hidden">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <TopNavigation />
          <ContentRenderer activeTab={activeTab} onNavigateToSettings={navigateToSettings} />
        </div>
      </div>
      <MqttLogWindow />
    </ModalManager>
  );
}
