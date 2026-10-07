import React from 'react';
import { Sprout, BrainCircuit, Database, ShieldCheck, Cpu, Layers } from 'lucide-react';

export default function AboutProject() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
          }}>
            <Sprout style={{ width: '32px', height: '32px', color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
              Corn Crop Pest Infestation Prediction Using Data Mining Techniques
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 600, marginTop: '0.2rem' }}>
              Academic Data Mining & Machine Learning Software Application
            </p>
          </div>
        </div>
        <p style={{ fontSize: '0.92rem', color: '#94a3b8', lineHeight: 1.6 }}>
          This software application provides a complete data mining pipeline for analyzing historical maize/corn crop pest infestation data and predicting potential pest infestation risks based on real-time environmental factors (temperature, humidity, rainfall, soil moisture, wind speed) and crop growth attributes.
        </p>
      </div>

      {/* Complete DMT Workflow System Architecture */}
      <div className="glass-card" style={{ padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
          Data Mining System Workflow Pipeline
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {[
            { step: '01', title: 'Data Collection', desc: 'CSV dataset inspection & attribute validation' },
            { step: '02', title: 'Preprocessing', desc: 'Median/Mode missing value imputation & deduplication' },
            { step: '03', title: 'Feature Selection', desc: 'Feature importance scoring & categorical label encoding' },
            { step: '04', title: 'Pattern Discovery', desc: 'Cross-tabulation of growth stage & seasonal infestation trends' },
            { step: '05', title: 'Classification', desc: 'Training Decision Tree, Random Forest, Naive Bayes, KNN & SVM' },
            { step: '06', title: 'Evaluation', desc: 'F1 Score, Accuracy, Precision, Recall & Confusion Matrix analysis' },
            { step: '07', title: 'Risk Prediction', desc: 'Model probability vector calculation & Low/Medium/High thresholding' },
            { step: '08', title: 'Recommendation', desc: 'Actionable Integrated Pest Management (IPM) guidelines' }
          ].map((item) => (
            <div key={item.step} style={{
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#10b981' }}>STEP {item.step}</span>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: '0.2rem 0' }}>{item.title}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Tech Stack & Key Algorithms */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '1.5rem' }}>
        {/* Technology Stack */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <Layers style={{ width: '20px', height: '20px', color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Technology Stack
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontWeight: 700, color: '#34d399' }}>Frontend:</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.88rem', marginLeft: '0.5rem' }}>
                React.js, Vite, Axios, React Router, Recharts, Lucide Icons, Vanilla CSS
              </span>
            </div>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>Backend:</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.88rem', marginLeft: '0.5rem' }}>
                Python 3.11, Flask REST API, Pandas, NumPy, Scikit-Learn, Joblib
              </span>
            </div>
            <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontWeight: 700, color: '#c084fc' }}>Database:</span>
              <span style={{ color: '#e2e8f0', fontSize: '0.88rem', marginLeft: '0.5rem' }}>
                SQLite (Persistent datasets, model evaluation logs & prediction history)
              </span>
            </div>
          </div>
        </div>

        {/* Data Mining Techniques */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <BrainCircuit style={{ width: '20px', height: '20px', color: '#c084fc' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Data Mining Algorithms Implemented
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.88rem' }}>
            <div>
              <span style={{ fontWeight: 700, color: '#34d399' }}>1. Random Forest Classifier:</span>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>
                Primary ensemble model aggregating decision trees to provide high generalization & feature importances.
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 700, color: '#38bdf8' }}>2. Decision Tree Classifier:</span>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>
                Interpretable rule-based classifier splitting on environmental threshold boundaries.
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>3. Naive Bayes Classifier:</span>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>
                Probabilistic classification based on Bayes theorem assuming feature independence.
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 700, color: '#c084fc' }}>4. K-Nearest Neighbors (KNN):</span>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>
                Instance-based learning identifying historical crop field neighbor clusters.
              </span>
            </div>
            <div>
              <span style={{ fontWeight: 700, color: '#f87171' }}>5. Support Vector Machine (SVM):</span>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.8rem' }}>
                Hyperplane boundary classifier with RBF kernel and probability outputs.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
