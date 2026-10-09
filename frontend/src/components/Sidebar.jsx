import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Sparkles, 
  BarChart3, 
  Cpu, 
  Search, 
  History, 
  Info,
  Sprout,
  X
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dataset', label: 'Dataset Management', icon: Database },
  { path: '/preprocessing', label: 'Data Preprocessing', icon: Sparkles },
  { path: '/analysis', label: 'Pattern Analysis', icon: BarChart3 },
  { path: '/models', label: 'Data Mining Models', icon: Cpu },
  { path: '/prediction', label: 'Pest Prediction', icon: Search },
  { path: '/history', label: 'Prediction History', icon: History },
  { path: '/about', label: 'About Project', icon: Info },
];

export default function Sidebar({ isOpen, onClose }) {
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay - strictly for mobile viewports */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="sidebar-mobile-overlay"
          aria-hidden="true"
        />
      )}

      <aside style={{
        position: 'fixed',
        top: 0,
        bottom: 0,
        left: 0,
        width: '260px',
        backgroundColor: '#0c1524',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out',
        boxShadow: '4px 0 25px rgba(0,0,0,0.5)'
      }} className="sidebar-container">
        
        {/* Header Branding */}
        <div style={{
          padding: '1.5rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}>
              <Sprout style={{ width: '24px', height: '24px', color: '#ffffff' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
                CornPest AI
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600, letterSpacing: '0.04em' }}>
                DATA MINING SYSTEM
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'none'
            }}
            className="mobile-close-btn"
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav style={{ padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
          <div style={{ 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            color: '#64748b', 
            letterSpacing: '0.08em', 
            padding: '0.5rem 0.75rem',
            textTransform: 'uppercase'
          }}>
            Navigation Menu
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.25rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={handleNavClick}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.7rem 0.9rem',
                      borderRadius: '10px',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#34d399' : '#94a3b8',
                      backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                      borderLeft: isActive ? '3px solid #10b981' : '3px solid transparent',
                      textDecoration: 'none',
                      transition: 'all 0.2s ease'
                    })}
                  >
                    <Icon style={{ width: '18px', height: '18px' }} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer info badge */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
              Scikit-Learn ML Engine Active
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
