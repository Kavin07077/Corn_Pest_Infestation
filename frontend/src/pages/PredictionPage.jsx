import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Thermometer, AlertCircle, Sparkles, Sprout, CheckCircle2, Info } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import PredictionResultModal from './PredictionResultModal';
import { api } from '../services/api';
import { useAgroClimate } from '../context/AgroClimateContext';

export default function PredictionPage() {
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [formData, setFormData] = useState({});
  const [validationErr, setValidationErr] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [syncedNotice, setSyncedNotice] = useState(null);

  const locationHook = useLocation();
  const { data: weatherData, selectedLocation } = useAgroClimate();

  const handleSyncWithWeather = useCallback(() => {
    if (!weatherData) return;

    setFormData(prev => {
      const next = { ...prev };
      if (modelInfo?.feature_names?.includes('Temperature') && weatherData.temperature !== null) {
        next.Temperature = Math.round(weatherData.temperature);
      }
      if (modelInfo?.feature_names?.includes('Humidity') && weatherData.humidity !== null) {
        next.Humidity = Math.round(weatherData.humidity);
      }
      if (modelInfo?.feature_names?.includes('Rainfall') && weatherData.rainfall !== null) {
        next.Rainfall = Math.round(weatherData.rainfall);
      }
      if (modelInfo?.feature_names?.includes('Soil_Moisture') && weatherData.soilMoisture !== null) {
        next.Soil_Moisture = Math.round(weatherData.soilMoisture);
      }
      if (modelInfo?.feature_names?.includes('Wind_Speed') && weatherData.windSpeed !== null) {
        next.Wind_Speed = Math.round(weatherData.windSpeed);
      }
      if (modelInfo?.feature_names?.includes('Location') && selectedLocation?.zone) {
        next.Location = selectedLocation.zone;
      }
      return next;
    });

    const rainCm = Math.round(weatherData.rainfallCm !== undefined ? weatherData.rainfallCm : (weatherData.rainfall / 10));
    const humCm = Math.round(weatherData.humidityCm !== undefined ? weatherData.humidityCm : (weatherData.humidity * 0.05));
    const tempVal = Math.round(weatherData.temperature);
    const humVal = Math.round(weatherData.humidity);
    const rainVal = Math.round(weatherData.rainfall);
    const soilVal = Math.round(weatherData.soilMoisture);
    const windVal = Math.round(weatherData.windSpeed);

    setSyncedNotice(`Synchronized readings from ${selectedLocation?.name || 'Selected Farm'}: Temperature ${tempVal}°C (Deg), Humidity ${humCm} cm (${humVal}%), Rainfall ${rainCm} cm (${rainVal} mm), Soil Moisture ${soilVal}%, Wind Speed ${windVal} km/h.`);
  }, [weatherData, modelInfo, selectedLocation]);

  useEffect(() => {
    async function loadFormSchema() {
      try {
        setLoading(true);
        const res = await api.getModels();
        setModelInfo(res);

        // Pre-fill smart defaults based on feature names
        const defaults = {
          Temperature: 30.5,
          Humidity: 78.0,
          Rainfall: 110.0,
          Soil_Moisture: 68.0,
          Wind_Speed: 12.0,
          Crop_Age: 35,
          Growth_Stage: 'Vegetative',
          Season: 'Kharif',
          Location: 'North Zone',
          Pest_Severity: 'Medium'
        };

        const initial = {};
        res.feature_names?.forEach((feat) => {
          initial[feat] = defaults[feat] !== undefined ? defaults[feat] : 0;
        });

        setFormData(initial);
      } catch (err) {
        console.error("Form schema load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFormSchema();
  }, []);

  // Check if routed with ?sync=live or state
  useEffect(() => {
    if (locationHook.search.includes('sync=live') && weatherData && modelInfo) {
      handleSyncWithWeather();
    }
  }, [locationHook.search, weatherData, modelInfo, handleSyncWithWeather]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setValidationErr(null);
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    // Basic validation
    for (const feat of modelInfo?.feature_names || []) {
      if (formData[feat] === '' || formData[feat] === undefined) {
        setValidationErr(`Please enter a valid value for "${feat}".`);
        return;
      }
    }

    try {
      setPredicting(true);
      setValidationErr(null);
      const res = await api.predictPest(formData);
      setPredictionResult(res);
    } catch (err) {
      setValidationErr(err.response?.data?.error || 'Failed to generate prediction.');
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading prediction parameters and trained feature schemas..." />;
  }

  const numFeatures = modelInfo?.feature_names?.filter(f => !['Growth_Stage', 'Season', 'Location', 'Pest_Severity'].includes(f)) || [];
  const catFeatures = modelInfo?.feature_names?.filter(f => ['Growth_Stage', 'Season', 'Location', 'Pest_Severity'].includes(f)) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.75rem 2rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
          🌽 Corn Crop Conditions & Environmental Parameter Input
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Active Model Candidate: <span style={{ color: '#10b981', fontWeight: 700 }}>{modelInfo?.best_model_name}</span> &bull; Enter real-time field readings below.
        </p>
      </div>

      {validationErr && (
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '10px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle style={{ width: '18px', height: '18px' }} />
          <span>{validationErr}</span>
        </div>
      )}

      {/* Main Prediction Input Form */}
      <form onSubmit={handlePredict} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Live Agro-Climatic Sync Card */}
        <div className="glass-card" style={{
          padding: '1.4rem 1.75rem',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.06) 100%)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <Sparkles style={{ width: '20px', height: '20px' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Live Agro-Climatic Feature Synchronization
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '3px 0 0 0' }}>
                  Open-Meteo readings for <strong style={{ color: '#38bdf8' }}>{selectedLocation?.name}</strong>: 
                  {weatherData ? (
                    <span style={{ color: '#e2e8f0' }}> {Math.round(weatherData.temperature)}°C (Deg) &bull; {Math.round(weatherData.humidityCm !== undefined ? weatherData.humidityCm : weatherData.humidity * 0.05)} cm Humidity ({Math.round(weatherData.humidity)}% RH) &bull; {Math.round(weatherData.rainfallCm !== undefined ? weatherData.rainfallCm : weatherData.rainfall / 10)} cm Rainfall ({Math.round(weatherData.rainfall)} mm) &bull; {Math.round(weatherData.soilMoisture)}% Soil Moisture &bull; {Math.round(weatherData.windSpeed)} km/h Wind</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}> Fetching real-time field data...</span>
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSyncWithWeather}
              disabled={!weatherData}
              className="btn-primary"
              style={{
                padding: '0.6rem 1.2rem',
                fontSize: '0.86rem',
                borderRadius: '10px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Sparkles style={{ width: '16px', height: '16px' }} />
              <span>Sync Live Weather Readings</span>
            </button>
          </div>

          {syncedNotice && (
            <div style={{
              marginTop: '0.85rem',
              padding: '0.55rem 0.95rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.16)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#34d399',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span>{syncedNotice}</span>
            </div>
          )}

          <div style={{
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.07)',
            fontSize: '0.74rem',
            color: '#64748b',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.4rem',
            lineHeight: 1.45
          }}>
            <Info style={{ width: '14px', height: '14px', color: '#64748b', flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong>Scientific Agronomy Principle:</strong> Real-time environmental readings provide empirical input features into the trained classification models. While specific thermal, moisture, and wind dynamics correlate with pest developmental cycles, ambient weather conditions alone do not confirm physical crop infestation. Field trap scouting and plant symptom scouting remain essential for physical confirmation.
            </span>
          </div>
        </div>

        {/* Section 1: Environmental Parameters */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Thermometer style={{ width: '22px', height: '22px', color: '#10b981' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Environmental Factors
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {numFeatures.map((feat) => {
              let label = feat.replace('_', ' ');
              let unit = '';
              let min = 0, max = 200, step = 0.5;

              if (feat === 'Temperature') { unit = '°C'; min = 10; max = 50; step = 0.5; }
              else if (feat === 'Humidity') { unit = '%'; min = 20; max = 100; step = 1; }
              else if (feat === 'Rainfall') { unit = 'mm'; min = 0; max = 300; step = 1; }
              else if (feat === 'Soil_Moisture') { unit = '%'; min = 10; max = 100; step = 1; }
              else if (feat === 'Wind_Speed') { unit = 'km/h'; min = 0; max = 50; step = 0.5; }
              else if (feat === 'Crop_Age') { unit = 'days'; min = 1; max = 120; step = 1; }

              return (
                <div key={feat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <label style={{ color: '#e2e8f0', fontWeight: 600 }}>{label}</label>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>
                      {formData[feat]} {unit}
                    </span>
                  </div>

                  <input 
                    type="number" 
                    step={step}
                    min={min}
                    max={max}
                    value={formData[feat] !== undefined ? formData[feat] : ''}
                    onChange={(e) => handleChange(feat, parseFloat(e.target.value) || 0)}
                    placeholder={`Enter ${label}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Crop Metadata & Stage */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <Sprout style={{ width: '22px', height: '22px', color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Crop Stage & Location Attributes
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {catFeatures.map((feat) => {
              let options = [];
              if (feat === 'Growth_Stage') options = ['Seedling', 'Vegetative', 'Flowering', 'Maturity'];
              else if (feat === 'Season') options = ['Kharif', 'Rabi', 'Summer'];
              else if (feat === 'Location') options = ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone'];
              else if (feat === 'Pest_Severity') options = ['Low', 'Medium', 'High'];
              else options = ['Default'];

              return (
                <div key={feat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}>
                    {feat.replace('_', ' ')}
                  </label>
                  <select 
                    value={formData[feat] || options[0]}
                    onChange={(e) => handleChange(feat, e.target.value)}
                  >
                    {options.map((opt) => (
                      <option key={opt} value={opt} style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>

        {/* Predict Action Button */}
        <button 
          type="submit" 
          disabled={predicting}
          className="btn-primary"
          style={{
            padding: '1rem',
            fontSize: '1.1rem',
            justifyContent: 'center',
            borderRadius: '14px',
            boxShadow: '0 8px 30px rgba(16, 185, 129, 0.4)'
          }}
        >
          <Sparkles style={{ width: '22px', height: '22px' }} />
          <span>{predicting ? 'Processing Data Mining Models...' : 'PREDICT PEST INFESTATION'}</span>
        </button>
      </form>

      {/* Result Modal Overlay */}
      {predictionResult && (
        <PredictionResultModal 
          result={predictionResult} 
          onClose={() => setPredictionResult(null)} 
        />
      )}
    </div>
  );
}
