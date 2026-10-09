import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import LiveAgroClimatePanel from '../components/LiveAgroClimatePanel';

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
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 1024);
  const location = useLocation();
  const navigate = useNavigate();

  const currentTitle = pageTitleMap[location.pathname] || 'Corn Pest Prediction';

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(prevMobile => {
        if (prevMobile !== mobile) {
          setIsSidebarOpen(!mobile);
        }
        return mobile;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleApplyToPrediction = (weatherData, loc) => {
    navigate('/prediction?sync=live', { state: { weatherData, location: loc } });
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0b1320' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div style={{
        flex: 1,
        marginLeft: (!isMobile && isSidebarOpen) ? '260px' : '0px',
        transition: 'margin-left 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        width: '100%'
      }}>
        <Navbar 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
          activeTitle={currentTitle} 
        />

        {/* Real-time agro-climatic weather panel positioned at top-right corner */}
        <div className="agro-panel-wrapper">
          <LiveAgroClimatePanel onApplyToPrediction={handleApplyToPrediction} />
        </div>

        <main className="main-content-layout">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
