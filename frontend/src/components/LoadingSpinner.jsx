import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading data mining models...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1.5rem',
      gap: '1rem'
    }}>
      <Loader2 style={{
        width: '36px',
        height: '36px',
        color: '#10b981',
        animation: 'spin 1s linear infinite'
      }} />
      <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}>
        {text}
      </span>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
