import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, ShieldCheck, Database, BrainCircuit } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleAccess = () => {
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2.5rem',
        textAlign: 'center',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)'
        }}>
          <Sprout style={{ width: '36px', height: '36px', color: '#ffffff' }} />
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>
          Corn Pest Prediction System
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '2rem' }}>
          Data Mining & Machine Learning Portal for Corn Crop Protection
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '0.85rem 0.5rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <Database style={{ width: '20px', height: '20px', color: '#34d399', margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>CSV Upload</div>
          </div>
          <div style={{
            padding: '0.85rem 0.5rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <BrainCircuit style={{ width: '20px', height: '20px', color: '#38bdf8', margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>5 ML Models</div>
          </div>
          <div style={{
            padding: '0.85rem 0.5rem',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <ShieldCheck style={{ width: '20px', height: '20px', color: '#c084fc', margin: '0 auto 0.4rem auto' }} />
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e2e8f0' }}>Risk Analysis</div>
          </div>
        </div>

        <button 
          onClick={handleAccess}
          className="btn-primary"
          style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '1rem' }}
        >
          <span>Access System Dashboard</span>
          <ArrowRight style={{ width: '18px', height: '18px' }} />
        </button>

        <div style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#64748b' }}>
          Academic Research Prototype &bull; Scikit-learn + Flask + React
        </div>
      </div>
    </div>
  );
}
