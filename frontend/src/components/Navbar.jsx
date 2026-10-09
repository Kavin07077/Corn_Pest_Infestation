import React, { useEffect, useState } from 'react';
import { Menu, Activity, Database, UserCheck } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ onMenuToggle, activeTitle }) {
  const [stats, setStats] = useState(null);
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    async function loadNavData() {
      try {
        const health = await api.checkHealth();
        setIsHealthy(health.status === 'healthy');
        const datasetStats = await api.getDatasetStatistics();
        setStats(datasetStats);
      } catch (err) {
        setIsHealthy(false);
      }
    }
    loadNavData();
  }, []);

  return (
    <header style={{
      height: '70px',
      backgroundColor: 'rgba(11, 19, 32, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.75rem'
    }}>
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center'
          }}
          className="menu-toggle-btn"
        >
          <Menu style={{ width: '22px', height: '22px' }} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
            {activeTitle || 'Corn Pest Prediction'}
          </h1>
        </div>
      </div>

      {/* Right status badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* System status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: isHealthy ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          fontSize: '0.78rem',
          fontWeight: 600,
          color: isHealthy ? '#34d399' : '#f87171'
        }}>
          <Activity style={{ width: '14px', height: '14px' }} />
          <span>{isHealthy ? 'API Online' : 'API Offline'}</span>
        </div>

        {/* Dataset telemetry summary pill */}
        {stats && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(14, 165, 233, 0.12)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#38bdf8'
          }} className="dataset-nav-pill">
            <Database style={{ width: '14px', height: '14px' }} />
            <span>{stats.total_records} Records</span>
          </div>
        )}

        {/* Academic User pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.35rem 0.85rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }} className="academic-user-pill">
          <UserCheck style={{ width: '16px', height: '16px', color: '#10b981' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>
            Agronomist Researcher
          </span>
        </div>
      </div>
    </header>
  );
}
