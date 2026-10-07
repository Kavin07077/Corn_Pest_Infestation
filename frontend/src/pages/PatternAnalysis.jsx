import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Legend, ScatterChart, Scatter, ZAxis, Cell 
} from 'recharts';
import { BarChart3, Thermometer, CloudRain, Sun, Sprout, Calendar } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';

const COLORS = ['#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#14b8a6', '#6366f1', '#10b981', '#f43f5e'];

export default function PatternAnalysis() {
  const [loading, setLoading] = useState(true);
  const [pestDist, setPestDist] = useState([]);
  const [envData, setEnvData] = useState(null);
  const [growthData, setGrowthData] = useState(null);
  const [seasonalData, setSeasonalData] = useState(null);

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true);
        const [pestRes, envRes, growthRes, seasonRes] = await Promise.all([
          api.getPestDistribution(),
          api.getEnvironmentAnalysis(),
          api.getGrowthStageAnalysis(),
          api.getSeasonalAnalysis()
        ]);

        setPestDist(pestRes.distribution || []);
        setEnvData(envRes);
        setGrowthData(growthRes);
        setSeasonalData(seasonRes);
      } catch (err) {
        console.error("Pattern analysis error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Performing pattern discovery & data mining analysis..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
          Exploratory Pattern Discovery & Data Mining Dashboard
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Uncover relationships between environmental conditions, growth stages, seasons, and pest infestation types.
        </p>
      </div>

      {/* Grid 1: Pest Frequency & Environmental Averages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Pest Occurrence Frequency */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Pest Infestation Frequency
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Total infestation records per pest species</p>
            </div>
            <BarChart3 style={{ width: '20px', height: '20px', color: '#10b981' }} />
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pestDist} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                <XAxis dataKey="pest" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {pestDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Environmental Parameter Averages by Pest */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Average Temperature & Humidity by Pest
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Mean Temperature (°C) vs Mean Humidity (%)</p>
            </div>
            <Thermometer style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
          </div>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={envData?.pest_averages || []} margin={{ top: 10, right: 10, left: -20, bottom: 45 }}>
                <XAxis dataKey={envData?.target_column || 'Pest_Type'} tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                <Bar dataKey="Temperature" name="Avg Temp (°C)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Humidity" name="Avg Humidity (%)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid 2: Growth Stage & Seasonal Cross-tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Growth Stage Analysis */}
        {growthData?.available && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                  Pest Infestation by Growth Stage
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Occurrence breakdown across Seedling, Vegetative, Flowering & Maturity</p>
              </div>
              <Sprout style={{ width: '20px', height: '20px', color: '#34d399' }} />
            </div>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData.growth_stages} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="growth_stage" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  {growthData.pests.slice(0, 5).map((pest, idx) => (
                    <Bar key={pest} dataKey={pest} name={pest} fill={COLORS[idx]} stackId="a" />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Seasonal Analysis */}
        {seasonalData?.available && (
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                  Pest Infestation by Season
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Seasonal occurrence patterns across Kharif, Rabi & Summer</p>
              </div>
              <Calendar style={{ width: '20px', height: '20px', color: '#c084fc' }} />
            </div>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={seasonalData.seasonal_trends} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="season" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  {seasonalData.pests.slice(0, 5).map((pest, idx) => (
                    <Bar key={pest} dataKey={pest} name={pest} fill={COLORS[(idx + 3) % COLORS.length]} stackId="b" />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
