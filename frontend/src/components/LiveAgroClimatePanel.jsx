import React, { useState } from 'react';
import { 
  CloudSun, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Layers, 
  Wind, 
  RefreshCw, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Navigation, 
  HelpCircle,
  Map as MapIcon,
  X
} from 'lucide-react';
import { useAgroClimate } from '../context/AgroClimateContext';
import { determineZone, reverseGeocodeLocation } from '../services/weatherService';
import LocationMapPicker from './LocationMapPicker';
import './LiveAgroClimatePanel.css';

export default function LiveAgroClimatePanel({ onApplyToPrediction }) {
  const {
    data,
    loading,
    refreshing,
    isStale,
    error,
    lastUpdated,
    nextRefreshSeconds,
    selectedLocation,
    setSelectedLocation,
    refreshNow,
    updatedFields
  } = useAgroClimate();

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [gpsAccessing, setGpsAccessing] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('');
  const [showSoilTooltip, setShowSoilTooltip] = useState(false);
  const [rainfallUnit, setRainfallUnit] = useState('cm'); // cm as requested
  const [humidityUnit, setHumidityUnit] = useState('cm'); // cm as requested

  // Quick Direct Access to Current GPS Location
  const handleQuickAccessGPS = () => {
    if (!navigator.geolocation) {
      setGpsNotice('Geolocation is not supported by your browser.');
      setTimeout(() => setGpsNotice(''), 4000);
      return;
    }

    setGpsAccessing(true);
    setGpsNotice('Accessing your current GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const zone = determineZone(lat, lon);
        let placeName = `Current Farm GPS (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;
        try {
          const rev = await reverseGeocodeLocation(lat, lon);
          if (rev) placeName = rev;
        } catch {
          // fallback
        }

        const gpsLoc = {
          id: `gps-${lat.toFixed(4)}-${lon.toFixed(4)}`,
          name: placeName,
          zone,
          latitude: lat,
          longitude: lon,
          country: 'Current Location'
        };

        setSelectedLocation(gpsLoc);
        setGpsAccessing(false);
        setGpsNotice(`✓ Locked to current farm location: ${placeName}`);
        setTimeout(() => setGpsNotice(''), 4500);
      },
      (err) => {
        setGpsAccessing(false);
        setGpsNotice(`Location access error: ${err.message}. Please allow permissions.`);
        setTimeout(() => setGpsNotice(''), 4500);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectFromMap = (loc) => {
    setSelectedLocation(loc);
    setIsMapModalOpen(false);
    setGpsNotice(`✓ Pinned to map: ${loc.name}`);
    setTimeout(() => setGpsNotice(''), 4000);
  };

  return (
    <div className="agro-panel-container">
      {/* 1. Header */}
      <div className="agro-panel-header">
        <div className="agro-panel-title-group">
          <div className="agro-panel-icon-wrap">
            <CloudSun style={{ width: '17px', height: '17px' }} />
          </div>
          <div>
            <h2 className="agro-panel-title">
              Live Agro-Climatic Conditions
            </h2>
          </div>
        </div>

        <div className="agro-header-actions">
          {/* Status Indicator */}
          {loading ? (
            <span className="agro-status-pill agro-status-stale">
              <span className="agro-status-dot"></span>
              <span>Connecting API...</span>
            </span>
          ) : isStale ? (
            <span className="agro-status-pill agro-status-stale" title="Network delay. Retaining last confirmed readings.">
              <span className="agro-status-dot"></span>
              <span>Stale Cache</span>
            </span>
          ) : data ? (
            <span className="agro-status-pill agro-status-live" title="Direct live stream from Open-Meteo">
              <span className="agro-status-dot agro-status-dot-pulse"></span>
              <span>Live (Open-Meteo)</span>
            </span>
          ) : (
            <span className="agro-status-pill agro-status-stale">
              <span className="agro-status-dot"></span>
              <span>Unavailable</span>
            </span>
          )}

          {/* Refresh countdown & button */}
          <button 
            onClick={refreshNow} 
            disabled={refreshing || loading}
            className="agro-refresh-btn"
            title="Auto-refreshes every 60s. Click to refresh now."
          >
            <RefreshCw 
              style={{ width: '13px', height: '13px' }} 
              className={refreshing ? 'agro-spin-icon' : ''} 
            />
            <span>{refreshing ? 'Updating' : `${nextRefreshSeconds}s`}</span>
          </button>
        </div>
      </div>

      {/* 2. Location & Map Pin Bar */}
      <div className="agro-location-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
          {/* Click to open Interactive Map Pin */}
          <button 
            onClick={() => setIsMapModalOpen(true)}
            className="agro-location-btn"
            title="Open Interactive Map to pin your exact farm location"
          >
            <MapPin style={{ width: '13px', height: '13px', color: '#38bdf8' }} />
            <span style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedLocation?.name || 'Farm Location'}
            </span>
            <span style={{ 
              fontSize: '0.7rem', 
              color: '#10b981', 
              fontWeight: 700, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '2px', 
              background: 'rgba(16, 185, 129, 0.15)',
              padding: '1px 5px',
              borderRadius: '4px'
            }}>
              <MapIcon style={{ width: '10px', height: '10px' }} />
              Pin on Map
            </span>
          </button>

          {/* Quick Access My Current Location Button */}
          <button
            onClick={handleQuickAccessGPS}
            disabled={gpsAccessing}
            className="agro-refresh-btn"
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              borderColor: 'rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              padding: '0.18rem 0.5rem',
              fontSize: '0.72rem'
            }}
            title="Access my current GPS location right now"
          >
            <Navigation style={{ width: '11px', height: '11px' }} />
            <span>{gpsAccessing ? 'Locating...' : 'My Location'}</span>
          </button>
        </div>

        <div className="agro-meta-timestamps">
          {lastUpdated && (
            <span title={`Browser fetch: ${lastUpdated.toLocaleTimeString()} | Source model: ${data?.sourceModelTime || 'N/A'}`}>
              <Clock style={{ width: '11px', height: '11px', display: 'inline', marginRight: '3px', verticalAlign: 'middle' }} />
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          {data?.sourceModelTime && (
            <span style={{ opacity: 0.8 }} title="Open-Meteo numerical weather model run timestamp">
              Obs: {data.sourceModelTime.replace('T', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* GPS Status Message Toast */}
      {gpsNotice && (
        <div style={{
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          color: '#7dd3fc',
          fontSize: '0.72rem',
          padding: '0.25rem 0.55rem',
          borderRadius: '6px',
          margin: '0.2rem 0 0.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <span>{gpsNotice}</span>
        </div>
      )}

      {/* Stale Warning Banner if applicable */}
      {isStale && (
        <div className="agro-stale-banner">
          <AlertTriangle style={{ width: '14px', height: '14px', flexShrink: 0 }} />
          <span>Weather service temporarily unreachable. Displaying last confirmed readings.</span>
        </div>
      )}

      {/* Fallback Error Display if initial load completely failed */}
      {!loading && !data && error && (
        <div style={{
          padding: '0.85rem',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          fontSize: '0.8rem',
          margin: '0.5rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle style={{ width: '16px', height: '16px' }} />
            <span>{error}</span>
          </div>
          <button 
            onClick={refreshNow} 
            className="btn-primary" 
            style={{ padding: '0.3rem 0.7rem', fontSize: '0.74rem' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* 3. Five Real-Time Environmental Parameters Grid */}
      <div className="agro-params-grid">
        {/* Param 1: Temperature in Degrees (°C) */}
        <div className={`agro-param-card ${updatedFields.temperature ? 'agro-value-updated' : ''}`}>
          <div className="agro-param-icon-header">
            <Thermometer style={{ width: '15px', height: '15px', color: '#f97316' }} />
            <span className="agro-param-label">Temperature</span>
          </div>
          {loading && !data ? (
            <div className="agro-skeleton-pulse" style={{ height: '26px', margin: '4px 0' }} />
          ) : (
            <div className="agro-param-value-wrap">
              <span className="agro-param-value">
                {data?.temperature !== null && data?.temperature !== undefined ? Math.round(data.temperature) : '--'}
              </span>
              <span className="agro-param-unit">°C</span>
            </div>
          )}
          <span className="agro-param-sublabel">Degrees Ambient</span>
        </div>

        {/* Param 2: Humidity in cm / % */}
        <div className={`agro-param-card ${updatedFields.humidity ? 'agro-value-updated' : ''}`}>
          <div className="agro-param-icon-header">
            <Droplets style={{ width: '15px', height: '15px', color: '#06b6d4' }} />
            <span className="agro-param-label">Humidity</span>
          </div>
          {loading && !data ? (
            <div className="agro-skeleton-pulse" style={{ height: '26px', margin: '4px 0' }} />
          ) : (
            <div className="agro-param-value-wrap">
              <span className="agro-param-value">
                {humidityUnit === 'cm'
                  ? (data?.humidityCm !== null && data?.humidityCm !== undefined ? Math.round(data.humidityCm) : (data?.humidity ? Math.round(data.humidity * 0.05) : '--'))
                  : (data?.humidity !== null && data?.humidity !== undefined ? Math.round(data.humidity) : '--')}
              </span>
              <span 
                className="agro-param-unit"
                onClick={() => setHumidityUnit(humidityUnit === 'cm' ? '%' : 'cm')}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                title="Click to toggle unit between cm and %"
              >
                {humidityUnit}
              </span>
            </div>
          )}
          <span 
            className="agro-param-sublabel"
            onClick={() => setHumidityUnit(humidityUnit === 'cm' ? '%' : 'cm')}
            style={{ cursor: 'pointer' }}
            title="Click to switch between cm water column equivalent and % RH"
          >
            {humidityUnit === 'cm' ? `${Math.round(data?.humidity || 0)}% RH Equiv.` : `${Math.round(data?.humidityCm || 0)} cm Col.`}
          </span>
        </div>

        {/* Param 3: Rainfall in cm */}
        <div className={`agro-param-card ${updatedFields.rainfall ? 'agro-value-updated' : ''}`}>
          <div className="agro-param-icon-header">
            <CloudRain style={{ width: '15px', height: '15px', color: '#3b82f6' }} />
            <span className="agro-param-label">Rainfall</span>
          </div>
          {loading && !data ? (
            <div className="agro-skeleton-pulse" style={{ height: '26px', margin: '4px 0' }} />
          ) : (
            <div className="agro-param-value-wrap">
              <span className="agro-param-value">
                {rainfallUnit === 'cm'
                  ? (data?.rainfallCm !== null && data?.rainfallCm !== undefined ? Math.round(data.rainfallCm) : Math.round(Number(data?.rainfall || 0) / 10))
                  : (data?.rainfall !== null && data?.rainfall !== undefined ? Math.round(data.rainfall) : 0)}
              </span>
              <span 
                className="agro-param-unit"
                onClick={() => setRainfallUnit(rainfallUnit === 'cm' ? 'mm' : 'cm')}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
                title="Click to toggle unit between cm and mm"
              >
                {rainfallUnit}
              </span>
            </div>
          )}
          <span 
            className="agro-param-sublabel" 
            title="Precipitation accumulation in current 1h interval"
            onClick={() => setRainfallUnit(rainfallUnit === 'cm' ? 'mm' : 'cm')}
            style={{ cursor: 'pointer' }}
          >
            {rainfallUnit === 'cm' ? `${Math.round(data?.rainfall || 0)} mm past 1h` : `${Math.round(data?.rainfallCm || 0)} cm past 1h`}
          </span>
        </div>

        {/* Param 4: Soil Moisture */}
        <div className={`agro-param-card ${updatedFields.soilMoisture ? 'agro-value-updated' : ''}`}>
          <div className="agro-param-icon-header">
            <Layers style={{ width: '15px', height: '15px', color: '#10b981' }} />
            <span className="agro-param-label">Soil Moisture</span>
          </div>
          {loading && !data ? (
            <div className="agro-skeleton-pulse" style={{ height: '26px', margin: '4px 0' }} />
          ) : (
            <div className="agro-param-value-wrap">
              <span className="agro-param-value">
                {data?.soilMoisture !== null && data?.soilMoisture !== undefined ? Math.round(data.soilMoisture) : '--'}
              </span>
              <span className="agro-param-unit">%</span>
            </div>
          )}
          <span 
            className="agro-param-sublabel" 
            style={{ cursor: 'pointer', borderBottom: '1px dotted rgba(255,255,255,0.3)' }}
            onClick={() => setShowSoilTooltip(!showSoilTooltip)}
            title="Modelled VWC (0–1 cm depth). Click for scientific details."
          >
            0–1cm Depth
          </span>
        </div>

        {/* Param 5: Wind Speed */}
        <div className={`agro-param-card ${updatedFields.windSpeed ? 'agro-value-updated' : ''}`}>
          <div className="agro-param-icon-header">
            <Wind style={{ width: '15px', height: '15px', color: '#94a3b8' }} />
            <span className="agro-param-label">Wind Speed</span>
          </div>
          {loading && !data ? (
            <div className="agro-skeleton-pulse" style={{ height: '26px', margin: '4px 0' }} />
          ) : (
            <div className="agro-param-value-wrap">
              <span className="agro-param-value">
                {data?.windSpeed !== null && data?.windSpeed !== undefined ? Math.round(data.windSpeed) : '--'}
              </span>
              <span className="agro-param-unit">km/h</span>
            </div>
          )}
          <span className="agro-param-sublabel">10m Velocity</span>
        </div>
      </div>

      {/* Soil Moisture Scientific Model Clarification */}
      {showSoilTooltip && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '8px',
          padding: '0.65rem 0.85rem',
          marginTop: '0.45rem',
          fontSize: '0.74rem',
          color: '#cbd5e1',
          lineHeight: 1.4
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 700, color: '#34d399' }}>
              🔬 Open-Meteo Soil Moisture Specification
            </span>
            <button 
              onClick={() => setShowSoilTooltip(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>
          <p>
            <strong>Measurement Depth:</strong> 0–1 cm topsoil volumetric water content (VWC).
          </p>
          <p>
            <strong>Model Source:</strong> ECMWF IFS / Land Numerical Agricultural Reanalysis (hourly interval).
          </p>
          <p style={{ color: '#fbbf24', marginTop: '0.2rem' }}>
            ℹ️ Notice: This reading represents numerical land-surface agro-meteorological modeling, not an in-situ physical capacitive ground probe.
          </p>
        </div>
      )}

      {/* 4. Panel Footer: Scientific Agronomy Note & Sync Button */}
      <div className="agro-panel-footer">
        <div className="agro-footnote-text">
          <HelpCircle style={{ width: '13px', height: '13px', color: '#64748b', flexShrink: 0 }} />
          <span>Auto-refreshes every 60s &bull; Empirical data for pest prediction</span>
        </div>

        {onApplyToPrediction && data && (
          <button 
            onClick={() => onApplyToPrediction(data, selectedLocation)}
            className="agro-sync-btn"
            title="Populate current environmental readings into the Corn Pest Infestation form"
          >
            <Sparkles style={{ width: '12px', height: '12px' }} />
            <span>Apply to Form</span>
          </button>
        )}
      </div>

      {/* 5. Interactive Leaflet Map Modal for Pinning Location */}
      {isMapModalOpen && (
        <LocationMapPicker
          initialLocation={selectedLocation}
          onSelectLocation={handleSelectFromMap}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}
    </div>
  );
}
