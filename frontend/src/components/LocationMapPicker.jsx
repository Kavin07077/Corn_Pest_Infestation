import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Navigation, 
  Search, 
  Check, 
  X, 
  Loader2,
  MapPin
} from 'lucide-react';
import { 
  searchGeocodingLocations, 
  reverseGeocodeLocation, 
  determineZone 
} from '../services/weatherService';

export default function LocationMapPicker({ initialLocation, onSelectLocation, onClose }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const initialLat = initialLocation?.latitude || 21.1458;
  const initialLon = initialLocation?.longitude || 79.0882;

  const [currentCoords, setCurrentCoords] = useState({ lat: initialLat, lon: initialLon });
  const [resolvedName, setResolvedName] = useState(initialLocation?.name || 'Selected Farm Location');
  const [activeZone, setActiveZone] = useState(initialLocation?.zone || 'Central Zone');
  const [isResolving, setIsResolving] = useState(false);
  const [hasPinnedNew, setHasPinnedNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('');

  // Custom emerald pin icon
  const createPinIcon = useCallback(() => {
    return L.divIcon({
      className: 'custom-ag-pin',
      html: `
        <div style="position: relative; width: 42px; height: 42px; pointer-events: auto;">
          <div style="
            background: linear-gradient(135deg, #10b981 0%, #047857 100%);
            width: 38px;
            height: 38px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75), 0 0 16px rgba(16, 185, 129, 0.6);
            border: 2.5px solid #ffffff;
            cursor: grab;
          ">
            <div style="
              width: 12px;
              height: 12px;
              background: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 17px;
            width: 8px;
            height: 8px;
            background: rgba(0, 0, 0, 0.5);
            border-radius: 50%;
            filter: blur(1.5px);
          "></div>
        </div>
      `,
      iconSize: [42, 42],
      iconAnchor: [19, 40],
      popupAnchor: [0, -40]
    });
  }, []);

  // Update marker position and resolve address
  const updatePinnedPosition = useCallback(async (lat, lon, zoomTo = false) => {
    setCurrentCoords({ lat, lon });
    setHasPinnedNew(true);
    const zone = determineZone(lat, lon);
    setActiveZone(zone);

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon]);
    }

    if (zoomTo && mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 13, { animate: true });
    }

    setIsResolving(true);
    try {
      const addressName = await reverseGeocodeLocation(lat, lon);
      setResolvedName(addressName);
    } catch {
      setResolvedName(`Pinned Farm (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`);
    } finally {
      setIsResolving(false);
    }
  }, []);

  // Initialize Fullscreen Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: 8,
      zoomControl: false, // Custom placed zoom control below
      attributionControl: true
    });

    // Add zoom control at bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // OpenStreetMap high resolution tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([initialLat, initialLon], {
      icon: createPinIcon(),
      draggable: true,
      autoPan: true
    }).addTo(map);

    // Marker drag event
    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      updatePinnedPosition(lat, lng, false);
    });

    // Map click / touch event: Drop pin anywhere
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      updatePinnedPosition(lat, lng, false);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;

    // Force recalculation to ensure 100vw x 100vh tiles render immediately
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    // Also handle window resize
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, [initialLat, initialLon, createPinIcon, updatePinnedPosition]);

  // Use current GPS location
  const handleUseCurrentGPS = () => {
    if (!navigator.geolocation) {
      setGpsNotice('Geolocation is not supported by your browser.');
      setTimeout(() => setGpsNotice(''), 4000);
      return;
    }

    setGpsLoading(true);
    setGpsNotice('Accessing GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        updatePinnedPosition(lat, lon, true);
        setGpsLoading(false);
        setGpsNotice('✓ Located to your current coordinates');
        setTimeout(() => setGpsNotice(''), 4000);
      },
      (err) => {
        setGpsLoading(false);
        setGpsNotice(`GPS Error: ${err.message}`);
        setTimeout(() => setGpsNotice(''), 4500);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Search places/farms
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setIsSearching(true);
    setSearchResults([]);
    try {
      const results = await searchGeocodingLocations(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Select place from search list
  const handleSelectSearchResult = (item) => {
    updatePinnedPosition(item.latitude, item.longitude, true);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Apply location and close
  const handleApplyLocation = () => {
    const loc = {
      id: `pin-${currentCoords.lat.toFixed(4)}-${currentCoords.lon.toFixed(4)}`,
      name: resolvedName,
      zone: activeZone,
      latitude: Number(currentCoords.lat),
      longitude: Number(currentCoords.lon),
      country: 'Field Site'
    };
    onSelectLocation(loc);
  };

  // Cross button at top right corner: if user touched/pinned a new place, apply it on close; otherwise close
  const handleCrossButtonClick = () => {
    if (hasPinnedNew) {
      handleApplyLocation();
    } else {
      onClose();
    }
  };

  // Prevent background scrolling while fullscreen map is open
  useEffect(() => {
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = origOverflow;
    };
  }, []);

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 999999,
      backgroundColor: '#0b1320',
      overflow: 'hidden',
      fontFamily: 'var(--font-primary, system-ui, sans-serif)'
    }}>
      {/* 1. Fullscreen Map Canvas */}
      <div 
        ref={mapContainerRef} 
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 1
        }} 
      />

      {/* 2. Top-Right Corner Cross Button */}
      <button 
        onClick={handleCrossButtonClick}
        aria-label="Close Map"
        title="Close Map (Applies Pinned Location)"
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7), 0 0 15px rgba(16, 185, 129, 0.3)',
          zIndex: 10002,
          transition: 'all 0.2s ease'
        }}
        className="map-fullscreen-cross-btn"
      >
        <X style={{ width: '24px', height: '24px', strokeWidth: 2.5 }} />
      </button>

      {/* 3. Top Floating Search & Action Bar */}
      <div className="map-top-bar">
        <div className="map-search-row">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.4rem', flex: 1 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, district, or agricultural region..."
                style={{
                  width: '100%',
                  paddingLeft: '2.2rem',
                  paddingRight: '0.8rem',
                  height: '38px',
                  fontSize: '0.86rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  color: '#ffffff'
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={isSearching} 
              className="btn-primary" 
              style={{ padding: '0 1rem', height: '38px', fontSize: '0.82rem', borderRadius: '10px' }}
            >
              {isSearching ? <Loader2 style={{ width: '15px', height: '15px' }} className="agro-spin-icon" /> : 'Search'}
            </button>
          </form>

          {/* Quick Access My Current Location */}
          <button
            type="button"
            onClick={handleUseCurrentGPS}
            disabled={gpsLoading}
            className="btn-secondary"
            style={{ 
              height: '38px', 
              fontSize: '0.82rem', 
              borderColor: 'rgba(56, 189, 248, 0.4)', 
              color: '#38bdf8',
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              borderRadius: '10px',
              padding: '0 0.9rem',
              whiteSpace: 'nowrap'
            }}
            title="Access device GPS to center on your current location"
          >
            {gpsLoading ? (
              <Loader2 style={{ width: '15px', height: '15px' }} className="agro-spin-icon" />
            ) : (
              <Navigation style={{ width: '15px', height: '15px' }} />
            )}
            <span style={{ fontWeight: 600 }}>My Location</span>
          </button>
        </div>

        {/* GPS Toast Notice */}
        {gpsNotice && (
          <div style={{
            background: 'rgba(14, 165, 233, 0.9)',
            color: '#ffffff',
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '0.4rem 0.85rem',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            alignSelf: 'flex-start'
          }}>
            {gpsNotice}
          </div>
        )}

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '12px',
            padding: '0.5rem',
            maxHeight: '200px',
            overflowY: 'auto',
            boxShadow: '0 14px 40px rgba(0, 0, 0, 0.7)'
          }}>
            {searchResults.map((res) => (
              <div
                key={res.id}
                onClick={() => handleSelectSearchResult(res)}
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.84rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  color: '#f8fafc'
                }}
                className="search-item-hover"
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{res.name}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.76rem', marginLeft: '6px' }}>({res.country})</span>
                </div>
                <span style={{ color: '#10b981', fontSize: '0.74rem', fontWeight: 600 }}>{res.zone}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Bottom Floating Card: Pinned Location Information & Action */}
      <div className="map-bottom-card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '240px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin style={{ width: '18px', height: '18px', color: '#10b981', flexShrink: 0 }} />
            <h4 style={{ 
              fontSize: '0.98rem', 
              fontWeight: 700, 
              color: '#f8fafc', 
              margin: 0,
              maxWidth: '380px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {isResolving ? 'Resolving address...' : resolvedName}
            </h4>
          </div>

          <div style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span>Lat: <strong style={{ color: '#38bdf8' }}>{Number(currentCoords.lat).toFixed(4)}°</strong></span>
            <span>Lon: <strong style={{ color: '#38bdf8' }}>{Number(currentCoords.lon).toFixed(4)}°</strong></span>
            <span>Zone: <strong style={{ color: '#10b981' }}>{activeZone}</strong></span>
          </div>

          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
            👉 Touch anywhere on map or drag pin &bull; Click cross button (X) or button below to confirm
          </span>
        </div>

        <button 
          type="button" 
          onClick={handleApplyLocation} 
          className="btn-primary" 
          style={{ 
            padding: '0.75rem 1.4rem', 
            fontSize: '0.88rem',
            borderRadius: '12px',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.45)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontWeight: 700
          }}
        >
          <Check style={{ width: '17px', height: '17px' }} />
          <span>Apply Pinned Location</span>
        </button>
      </div>
    </div>,
    document.body
  );
}
