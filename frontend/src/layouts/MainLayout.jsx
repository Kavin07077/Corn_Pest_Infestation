import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const pageTitleMap = {
  '/dashboard': 'Dashboard Overview',
  '/dataset': 'Dataset Management & Pre-preview',
  '/preprocessing': 'Data Preprocessing Pipeline',
  '/analysis': 'Data Pattern & Exploratory Analysis',
  '/models': 'Data Mining Algorithms & Training',
  '/prediction': 'Corn Pest Infestation Prediction',
  '/history': 'Prediction History Log',
  '/about': 'About Data Mining Project',
  '/login': 'Agronomist Portal Access'
};

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const currentTitle = pageTitleMap[location.pathname] || 'Corn Pest Prediction';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b1320' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div style={{
        flex: 1,
        marginLeft: isSidebarOpen ? '260px' : '0px',
        transition: 'margin-left 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        <Navbar 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          activeTitle={currentTitle} 
        />

        <main style={{ flex: 1, padding: '1.75rem', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
