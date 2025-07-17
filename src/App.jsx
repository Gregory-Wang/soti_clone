import React from 'react';
import Sidebar from "@/components/layout/Sidebar.jsx";
import TopNavigation from "@/components/layout/TopNavigation";
import ContentRenderer from "@/components/layout/ContentRenderer";
import { useState } from "react";

export default function App() {

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  
  return (
    <div className="flex h-screen w-screen bg-gray-100">
          <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              isCollapsed={isCollapsed}
              setIsCollapsed={setIsCollapsed}
          />
          <div className="flex-1 flex flex-col">
              <TopNavigation />
              <ContentRenderer activeTab={activeTab} />
          </div>
      </div>
  );
}
