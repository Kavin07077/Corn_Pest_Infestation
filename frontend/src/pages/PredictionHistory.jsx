import React, { useState, useEffect } from 'react';
import { History, Trash2, Search, Calendar, Bug, AlertTriangle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';

export default function PredictionHistory() {
  const [loading, setLoading] = useState(true);
  const [historyList, setHistoryList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.getPredictionHistory(100);
      setHistoryList(res.history || []);
    } catch (err) {
      console.error("History fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete prediction record #${id}?`)) return;

    try {
      await api.deletePrediction(id);
      setHistoryList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert("Failed to delete prediction entry.");
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching stored predictions from SQLite database..." />;
  }

  const filteredHistory = historyList.filter(item => {
    const pestMatch = item.predicted_pest.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = item.prediction_date.includes(searchTerm);
    const riskMatch = item.risk_level.toLowerCase().includes(searchTerm.toLowerCase());
    return pestMatch || dateMatch || riskMatch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Prediction History & Query Audit Log
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Persistent SQLite record of previous pest predictions, confidence scores, and risk classifications.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search style={{ width: '16px', height: '16px', color: '#64748b', position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search history by pest or date..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {filteredHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: '#64748b' }}>
            <History style={{ width: '36px', height: '36px', color: '#64748b', margin: '0 auto 0.75rem auto' }} />
            <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#94a3b8' }}>No predictions found</div>
            <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>Run predictions to see entries logged here.</div>
          </div>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Query ID</th>
                  <th>Timestamp</th>
                  <th>Predicted Pest</th>
                  <th>Input Parameters Summary</th>
                  <th>Probability</th>
                  <th>Risk Level</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 700, color: '#94a3b8' }}>#{row.id}</td>
                    <td style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{row.prediction_date}</td>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>{row.predicted_pest}</td>
                    <td style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '300px', whiteSpace: 'normal' }}>
                      Temp: {row.input_data?.Temperature}°C | Hum: {row.input_data?.Humidity}% | Rain: {row.input_data?.Rainfall}mm | Stage: {row.input_data?.Growth_Stage}
                    </td>
                    <td style={{ fontWeight: 700, color: '#34d399' }}>
                      {(row.probability * 100).toFixed(1)}%
                    </td>
                    <td>
                      <span className={`badge badge-${row.risk_level.toLowerCase()}`}>
                        {row.risk_level}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDelete(row.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#f87171',
                          cursor: 'pointer',
                          padding: '0.3rem',
                          borderRadius: '4px'
                        }}
                        title="Delete log record"
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
