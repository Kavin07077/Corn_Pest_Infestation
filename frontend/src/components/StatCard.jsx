import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, trend, color = 'emerald' }) {
  const colorMap = {
    emerald: { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399', border: 'rgba(16, 185, 129, 0.3)' },
    blue: { bg: 'rgba(14, 165, 233, 0.15)', text: '#38bdf8', border: 'rgba(14, 165, 233, 0.3)' },
    amber: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' },
    purple: { bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc', border: 'rgba(168, 85, 247, 0.3)' },
  };

  const scheme = colorMap[color] || colorMap.emerald;

  return (
    <div className="glass-card glass-card-interactive" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: scheme.bg,
            border: `1px solid ${scheme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon style={{ width: '20px', height: '20px', color: scheme.text }} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
          {value}
        </div>
        {trend && (
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: scheme.text }}>
            {trend}
          </span>
        )}
      </div>

      {subtext && (
        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.5rem' }}>
          {subtext}
        </div>
      )}
    </div>
  );
}
