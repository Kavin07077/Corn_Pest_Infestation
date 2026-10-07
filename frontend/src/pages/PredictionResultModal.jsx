import React from 'react';
import { ShieldAlert, ShieldCheck, Shield, CheckCircle, AlertTriangle, X, Sprout } from 'lucide-react';

export default function PredictionResultModal({ result, onClose }) {
  if (!result) return null;

  const { predicted_pest, probability_percent, risk_level, all_probabilities, recommendation, model_used } = result;

  const getRiskIcon = () => {
    if (risk_level === 'HIGH') return <ShieldAlert style={{ width: '28px', height: '28px', color: '#f87171' }} />;
    if (risk_level === 'MEDIUM') return <AlertTriangle style={{ width: '28px', height: '28px', color: '#fbbf24' }} />;
    return <ShieldCheck style={{ width: '28px', height: '28px', color: '#34d399' }} />;
  };

  const getRiskBadgeClass = () => {
    if (risk_level === 'HIGH') return 'badge-high';
    if (risk_level === 'MEDIUM') return 'badge-medium';
    return 'badge-low';
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      overflowY: 'auto'
    }}>
      <div className="glass-card" style={{
        maxWidth: '680px',
        width: '100%',
        padding: '2rem',
        maxHeight: '90vh',
        overflowY: 'auto',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer'
          }}
        >
          <X style={{ width: '18px', height: '18px' }} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            PEST PREDICTION RESULT CARD
          </span>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
            {predicted_pest}
          </h2>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
            Inference engine: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{model_used}</span>
          </div>
        </div>

        {/* Main Risk & Probability Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          padding: '1.25rem',
          borderRadius: '14px',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '1.5rem'
        }}>
          {/* Infestation Probability */}
          <div style={{ textAlign: 'center', borderRight: '1px solid rgba(255, 255, 255, 0.08)', paddingRight: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Infestation Probability</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#34d399', lineHeight: 1.2, marginTop: '0.2rem' }}>
              {probability_percent}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Model Confidence</div>
          </div>

          {/* Risk Level */}
          <div style={{ textAlign: 'center', paddingLeft: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginBottom: '0.4rem' }}>Infestation Risk Level</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {getRiskIcon()}
              <span className={`badge ${getRiskBadgeClass()}`} style={{ fontSize: '0.95rem', padding: '0.4rem 0.85rem' }}>
                {risk_level} RISK
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Pest Probability Ranking */}
        {all_probabilities && all_probabilities.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Multiple Pest Probability Breakdown
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '180px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {all_probabilities.slice(0, 5).map((item, idx) => (
                <div key={item.pest} style={{
                  padding: '0.6rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: idx === 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${idx === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? '#34d399' : '#e2e8f0' }}>
                      {idx + 1}. {item.pest}
                    </span>
                    <span style={{ fontWeight: 700, color: idx === 0 ? '#34d399' : '#94a3b8' }}>
                      {item.percentage}%
                    </span>
                  </div>
                  <div style={{ height: '5px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div 
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        backgroundColor: idx === 0 ? '#10b981' : '#38bdf8',
                        borderRadius: '3px'
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informational IPM Preventive Recommendations */}
        {recommendation && (
          <div style={{
            padding: '1.25rem',
            borderRadius: '12px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Sprout style={{ width: '18px', height: '18px', color: '#10b981' }} />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34d399' }}>
                Integrated Pest Management (IPM) Preventive Guidelines
              </h4>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem', fontStyle: 'italic' }}>
              {recommendation.description}
            </p>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recommendation.recommendations.map((rec, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                  <CheckCircle style={{ width: '15px', height: '15px', color: '#10b981', marginTop: '0.15rem', flexShrink: 0 }} />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action button */}
        <button 
          onClick={onClose}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
        >
          <span>Done & Close Result</span>
        </button>
      </div>
    </div>
  );
}
