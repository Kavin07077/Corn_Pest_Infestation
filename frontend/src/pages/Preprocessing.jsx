import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Database, ArrowRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';

export default function Preprocessing() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [prepResult, setPrepResult] = useState(null);

  const fetchPrepData = async () => {
    try {
      setLoading(true);
      const res = await api.runPreprocessing();
      setPrepResult(res);
    } catch (err) {
      console.error("Preprocessing fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrepData();
  }, []);

  const handleRunPipeline = async () => {
    try {
      setProcessing(true);
      const res = await api.runPreprocessing();
      setPrepResult(res);
    } catch (err) {
      console.error("Pipeline run error:", err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Executing Python Scikit-Learn data cleaning pipeline..." />;
  }

  const cleanStats = prepResult?.clean_stats || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Action Header Banner */}
      <div className="glass-card" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Data Preprocessing Telemetry Engine
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Detects missing values, imputes numerical/categorical features, and strips duplicates for ML ready tensors.
          </p>
        </div>

        <button 
          onClick={handleRunPipeline} 
          disabled={processing}
          className="btn-primary"
        >
          <Sparkles style={{ width: '18px', height: '18px' }} />
          <span>{processing ? 'Processing Dataset...' : 'Run Preprocessing Pipeline'}</span>
        </button>
      </div>

      {/* Actual Preprocessing Telemetry Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard 
          title="Total Raw Records" 
          value={cleanStats.total_records?.toLocaleString() || 0} 
          subtext="Input CSV rows" 
          icon={Database} 
          color="blue" 
        />
        <StatCard 
          title="Missing Values Imputed" 
          value={cleanStats.missing_values || 0} 
          subtext="Median & Mode Imputation" 
          icon={Sparkles} 
          color="amber" 
        />
        <StatCard 
          title="Duplicate Records Removed" 
          value={cleanStats.duplicate_records || 0} 
          subtext="Deduplicated rows" 
          icon={CheckCircle2} 
          color="purple" 
        />
        <StatCard 
          title="Clean Records Ready" 
          value={cleanStats.clean_records?.toLocaleString() || 0} 
          subtext="Processed tensor size" 
          icon={ShieldCheck} 
          color="emerald" 
        />
      </div>

      {/* Data Transformation Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Preprocessing Summary Table */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
            Preprocessing Telemetry Summary
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>Target Attribute:</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>{cleanStats.target_column}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>Numerical Imputation Method:</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Median Imputation</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>Categorical Imputation Method:</span>
              <span style={{ color: '#c084fc', fontWeight: 700 }}>Mode Imputation</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>Categorical Feature Encoder:</span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>Scikit-Learn LabelEncoder</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>Numerical Feature Scaler:</span>
              <span style={{ color: '#34d399', fontWeight: 700 }}>StandardScaler (Zero Mean, Unit Variance)</span>
            </div>
          </div>
        </div>

        {/* Feature Vectors */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
            Numerical vs Categorical Split
          </h3>

          <div style={{ marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 700, marginBottom: '0.5rem' }}>
              Numerical Features ({prepResult?.features?.numerical?.length}):
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {prepResult?.features?.numerical?.map((col) => (
                <span key={col} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8', fontSize: '0.8rem', fontWeight: 600 }}>
                  {col}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#c084fc', fontWeight: 700, marginBottom: '0.5rem' }}>
              Categorical Features ({prepResult?.features?.categorical?.length}):
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {prepResult?.features?.categorical?.map((col) => (
                <span key={col} style={{ padding: '0.3rem 0.6rem', borderRadius: '6px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', fontSize: '0.8rem', fontWeight: 600 }}>
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clean Records Sample Preview */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
          Cleaned Dataset Output Sample (First 10 Cleaned Records)
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                {prepResult?.sample_records?.[0] && Object.keys(prepResult.sample_records[0]).map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prepResult?.sample_records?.map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(row).map((col) => (
                    <td key={col} style={{ fontWeight: col === cleanStats.target_column ? 700 : 400, color: col === cleanStats.target_column ? '#34d399' : 'inherit' }}>
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
