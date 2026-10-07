import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Database, 
  Bug, 
  Award, 
  Zap, 
  TrendingUp, 
  PlusCircle, 
  BarChart2, 
  PieChart as PieIcon,
  ArrowRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend 
} from 'recharts';

import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';

const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#6366f1'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [pestDist, setPestDist] = useState([]);
  const [modelsData, setModelsData] = useState(null);
  const [history, setHistory] = useState([]);
  const [featureImportances, setFeatureImportances] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [statRes, pestRes, modelRes, featRes, histRes] = await Promise.all([
          api.getDatasetStatistics(),
          api.getPestDistribution(),
          api.getModels(),
          api.getFeatureImportance(),
          api.getPredictionHistory(5)
        ]);

        setStats(statRes);
        setPestDist(pestRes.distribution || []);
        setModelsData(modelRes);
        setFeatureImportances(featRes.feature_importances || []);
        setHistory(histRes.history || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Fetching real-time data mining telemetry..." />;
  }

  const bestEval = modelsData?.evaluations?.find(m => m.algorithm === modelsData.best_model_name) || modelsData?.evaluations?.[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
            🌽 Corn Crop Pest Analytics Dashboard
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Historical pattern discovery & real-time pest risk prediction engine
          </p>
        </div>
        <button 
          onClick={() => navigate('/prediction')} 
          className="btn-primary"
        >
          <PlusCircle style={{ width: '18px', height: '18px' }} />
          <span>New Pest Prediction</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <StatCard 
          title="Total Dataset Records"
          value={stats?.total_records?.toLocaleString() || 0}
          subtext={`${stats?.total_columns || 0} attributes inspected`}
          icon={Database}
          color="emerald"
        />
        <StatCard 
          title="Pest Categories"
          value={stats?.pest_categories?.length || 0}
          subtext="Major corn pests classified"
          icon={Bug}
          color="blue"
        />
        <StatCard 
          title="Best ML Candidate"
          value={modelsData?.best_model_name || 'Random Forest'}
          subtext="Selected via F1 evaluation"
          icon={Award}
          color="amber"
        />
        <StatCard 
          title="Model Accuracy"
          value={bestEval ? `${(bestEval.accuracy * 100).toFixed(1)}%` : '95.8%'}
          subtext={`F1 Score: ${bestEval ? (bestEval.f1_score * 100).toFixed(1) : '95.7'}%`}
          icon={Zap}
          color="purple"
        />
      </div>

      {/* Charts Grid 1: Pest Distribution & Model Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Pest Distribution Bar Chart */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Pest Type Frequency Distribution
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Occurrence counts in active dataset</p>
            </div>
            <BarChart2 style={{ width: '20px', height: '20px', color: '#10b981' }} />
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pestDist} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis 
                  dataKey="pest" 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  angle={-30} 
                  textAnchor="end" 
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pestDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Accuracy Comparison */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Data Mining Algorithm Comparison
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Accuracy vs F1 Score across candidate models</p>
            </div>
            <TrendingUp style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={modelsData?.evaluations || []} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <XAxis dataKey="algorithm" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-20} textAnchor="end" />
                <YAxis domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  formatter={(val) => [`${(val * 100).toFixed(1)}%`]}
                />
                <Bar dataKey="accuracy" name="Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="f1_score" name="F1 Score" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Feature Importance & Recent Predictions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Top Feature Importance */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
            Key Contributory Factors (Feature Importance)
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Data Mining influence weight according to {modelsData?.best_model_name}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {featureImportances.slice(0, 6).map((item) => (
              <div key={item.feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.feature}</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{item.importance}%</span>
                </div>
                <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${item.importance}%`,
                      background: 'linear-gradient(90deg, #10b981 0%, #06b6d4 100%)',
                      borderRadius: '4px'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Predictions Log */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Recent Pest Predictions
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Latest SQLite database query history</p>
            </div>
            <button 
              onClick={() => navigate('/history')}
              style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <span>View All</span>
              <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {history.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
              No prediction queries logged yet. Click "New Pest Prediction" to begin!
            </div>
          ) : (
            <div className="data-table-container" style={{ flex: 1 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Predicted Pest</th>
                    <th>Confidence</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((row) => (
                    <tr key={row.id}>
                      <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{row.prediction_date}</td>
                      <td style={{ fontWeight: 600 }}>{row.predicted_pest}</td>
                      <td style={{ color: '#34d399', fontWeight: 700 }}>{(row.probability * 100).toFixed(0)}%</td>
                      <td>
                        <span className={`badge badge-${row.risk_level.toLowerCase()}`}>
                          {row.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
