import React, { useState, useEffect } from 'react';
import { Cpu, Award, Zap, BarChart2, CheckCircle2, Grid } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../services/api';

export default function DataMiningModels() {
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [testSplit, setTestSplit] = useState(0.2);
  const [modelsData, setModelsData] = useState(null);
  const [featureImportances, setFeatureImportances] = useState([]);
  const [selectedAlgoCM, setSelectedAlgoCM] = useState(null);

  const fetchModelData = async () => {
    try {
      setLoading(true);
      const [evalRes, featRes] = await Promise.all([
        api.getModelEvaluation(),
        api.getFeatureImportance()
      ]);

      setModelsData(evalRes);
      setFeatureImportances(featRes.feature_importances || []);
      if (evalRes.evaluations?.length > 0) {
        // Default to best model confusion matrix
        const best = evalRes.evaluations.find(m => m.algorithm === evalRes.best_model_name) || evalRes.evaluations[0];
        setSelectedAlgoCM(best);
      }
    } catch (err) {
      console.error("Model fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelData();
  }, []);

  const handleTrainModels = async () => {
    try {
      setTraining(true);
      const res = await api.trainModels({ test_size: parseFloat(testSplit) });
      setModelsData({
        best_model_name: res.best_model,
        evaluations: res.evaluations,
        target_classes: res.evaluations[0]?.class_labels || []
      });
      setFeatureImportances(res.feature_importances || []);
      const best = res.evaluations.find(m => m.algorithm === res.best_model) || res.evaluations[0];
      setSelectedAlgoCM(best);
    } catch (err) {
      console.error("Train models error:", err);
    } finally {
      setTraining(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Evaluating classification metrics (Accuracy, Precision, Recall, F1)..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Action Banner */}
      <div className="glass-card" style={{
        padding: '1.75rem 2rem',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(14, 165, 233, 0.1) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
            Data Mining Classification Suite
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Train & compare Decision Tree, Random Forest, Naive Bayes, KNN, and SVM models on the active dataset.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
              Split: {((1 - testSplit) * 100).toFixed(0)}% Train / {(testSplit * 100).toFixed(0)}% Test
            </span>
          </div>

          <button 
            onClick={handleTrainModels} 
            disabled={training}
            className="btn-primary"
          >
            <Cpu style={{ width: '18px', height: '18px' }} />
            <span>{training ? 'Training Models...' : 'Train & Evaluate Models'}</span>
          </button>
        </div>
      </div>

      {/* Model Performance Comparison Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Model Evaluation & Comparison Matrix
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Evaluated on {(testSplit * 100).toFixed(0)}% holdout test dataset. Best performing model is auto-selected for predictions.
            </p>
          </div>

          {modelsData?.best_model_name && (
            <div className="badge badge-emerald">
              <Award style={{ width: '14px', height: '14px' }} />
              <span>Active Best: {modelsData.best_model_name}</span>
            </div>
          )}
        </div>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Classification Algorithm</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>Confusion Matrix</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {modelsData?.evaluations?.map((item) => {
                const isBest = item.algorithm === modelsData.best_model_name;
                const isSelected = selectedAlgoCM?.algorithm === item.algorithm;

                return (
                  <tr key={item.algorithm} style={{
                    backgroundColor: isBest ? 'rgba(16, 185, 129, 0.08)' : 'transparent'
                  }}>
                    <td style={{ fontWeight: 700, color: isBest ? '#34d399' : '#f8fafc' }}>
                      {item.algorithm} {isBest && '★'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      {(item.accuracy * 100).toFixed(2)}%
                    </td>
                    <td>{(item.precision * 100).toFixed(2)}%</td>
                    <td>{(item.recall * 100).toFixed(2)}%</td>
                    <td style={{ fontWeight: 700, color: '#38bdf8' }}>
                      {(item.f1_score * 100).toFixed(2)}%
                    </td>
                    <td>
                      <button 
                        onClick={() => setSelectedAlgoCM(item)}
                        style={{
                          background: isSelected ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          border: `1px solid ${isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: isSelected ? '#34d399' : '#94a3b8',
                          padding: '0.3rem 0.65rem',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                      >
                        <Grid style={{ width: '12px', height: '12px' }} />
                        <span>View Grid</span>
                      </button>
                    </td>
                    <td>
                      {isBest ? (
                        <span className="badge badge-emerald">PRIMARY BEST</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CANDIDATE</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Confusion Matrix Grid & Feature Importances */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Interactive Confusion Matrix Visualizer */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Confusion Matrix Heatmap
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Selected: <span style={{ color: '#10b981', fontWeight: 700 }}>{selectedAlgoCM?.algorithm}</span>
              </p>
            </div>
            <Grid style={{ width: '20px', height: '20px', color: '#10b981' }} />
          </div>

          {selectedAlgoCM?.confusion_matrix ? (
            <div style={{ overflowX: 'auto' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 600 }}>
                Predicted Class &rarr;
              </div>
              <div style={{ display: 'inline-block', minWidth: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.4rem', color: '#64748b' }}>Actual ↓</th>
                      {selectedAlgoCM.class_labels.map((lbl, idx) => (
                        <th key={idx} style={{ padding: '0.4rem', color: '#e2e8f0', fontWeight: 600, fontSize: '0.7rem', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                          {lbl}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAlgoCM.confusion_matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td style={{ padding: '0.4rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                          {selectedAlgoCM.class_labels[rIdx]}
                        </td>
                        {row.map((cellVal, cIdx) => {
                          const isDiag = rIdx === cIdx;
                          const intensity = Math.min(1, cellVal / 25);
                          return (
                            <td 
                              key={cIdx} 
                              style={{
                                padding: '0.5rem',
                                textAlign: 'center',
                                fontWeight: isDiag ? 800 : 500,
                                backgroundColor: isDiag 
                                  ? `rgba(16, 185, 129, ${0.2 + intensity * 0.6})` 
                                  : cellVal > 0 ? `rgba(239, 68, 68, ${0.15 + intensity * 0.4})` : 'rgba(255,255,255,0.02)',
                                color: isDiag ? '#ffffff' : cellVal > 0 ? '#f87171' : '#64748b',
                                border: '1px solid rgba(255,255,255,0.05)'
                              }}
                            >
                              {cellVal}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              Select a model above to view its confusion matrix.
            </div>
          )}
        </div>

        {/* Feature Importance Breakdown */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc' }}>
                Feature Importance Analysis
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Contribution score per factor according to {modelsData?.best_model_name}
              </p>
            </div>
            <Zap style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {featureImportances.map((item) => (
              <div key={item.feature}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.feature}</span>
                  <span style={{ color: '#38bdf8', fontWeight: 700 }}>{item.importance}%</span>
                </div>
                <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div 
                    style={{
                      height: '100%',
                      width: `${item.importance}%`,
                      background: 'linear-gradient(90deg, #38bdf8 0%, #10b981 100%)',
                      borderRadius: '4px'
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
