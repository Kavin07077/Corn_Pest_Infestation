import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  fetchAgroClimateData, 
  getSavedLocation, 
  saveLocation, 
  DEFAULT_FARM_LOCATION 
} from '../services/weatherService';

const AgroClimateContext = createContext(null);

const REFRESH_INTERVAL_SECONDS = 60;

export function AgroClimateProvider({ children }) {
  const [selectedLocation, setSelectedLocationState] = useState(() => getSavedLocation() || DEFAULT_FARM_LOCATION);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [nextRefreshSeconds, setNextRefreshSeconds] = useState(REFRESH_INTERVAL_SECONDS);
  const [updatedFields, setUpdatedFields] = useState({});

  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);
  const previousValuesRef = useRef({});

  const setSelectedLocation = useCallback((loc) => {
    saveLocation(loc);
    setSelectedLocationState(loc);
  }, []);

  const executeFetch = useCallback(async (isManual = false) => {
    // Prevent overlapping requests
    if (isFetchingRef.current) {
      return;
    }

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;

    if (!data) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const result = await fetchAgroClimateData(
        selectedLocation.latitude,
        selectedLocation.longitude,
        controller.signal
      );

      // Detect which fields changed for subtle micro-animations
      const changed = {};
      const prev = previousValuesRef.current;
      if (prev.temperature !== undefined && prev.temperature !== result.temperature) changed.temperature = true;
      if (prev.humidity !== undefined && prev.humidity !== result.humidity) changed.humidity = true;
      if (prev.rainfall !== undefined && prev.rainfall !== result.rainfall) changed.rainfall = true;
      if (prev.soilMoisture !== undefined && prev.soilMoisture !== result.soilMoisture) changed.soilMoisture = true;
      if (prev.windSpeed !== undefined && prev.windSpeed !== result.windSpeed) changed.windSpeed = true;

      previousValuesRef.current = {
        temperature: result.temperature,
        humidity: result.humidity,
        rainfall: result.rainfall,
        soilMoisture: result.soilMoisture,
        windSpeed: result.windSpeed
      };

      setUpdatedFields(changed);
      // Clear highlight after 2.5s
      setTimeout(() => {
        setUpdatedFields({});
      }, 2500);

      setData(result);
      setLastUpdated(new Date());
      setIsStale(false);
      setError(null);
      setNextRefreshSeconds(REFRESH_INTERVAL_SECONDS);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      console.warn('Agro-climatic data fetch interrupted/failed:', err);
      // Keep existing data visible but mark it as stale
      if (data) {
        setIsStale(true);
        setError('Network or Open-Meteo temporary delay. Retaining latest confirmed field readings.');
      } else {
        setError('Unable to load live weather readings. Please check connectivity.');
      }
    } finally {
      isFetchingRef.current = false;
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedLocation, data]);

  // Initial fetch and fetch on location change
  useEffect(() => {
    setData(null);
    setLoading(true);
    setIsStale(false);
    setError(null);
    setNextRefreshSeconds(REFRESH_INTERVAL_SECONDS);

    executeFetch(true);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedLocation.latitude, selectedLocation.longitude]);

  // Automatic 60-second countdown and refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      setNextRefreshSeconds((prev) => {
        if (prev <= 1) {
          // Trigger automatic 60s background fetch
          executeFetch(false);
          return REFRESH_INTERVAL_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [executeFetch]);

  const refreshNow = useCallback(() => {
    setNextRefreshSeconds(REFRESH_INTERVAL_SECONDS);
    executeFetch(true);
  }, [executeFetch]);

  return (
    <AgroClimateContext.Provider
      value={{
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
      }}
    >
      {children}
    </AgroClimateContext.Provider>
  );
}

export function useAgroClimate() {
  const context = useContext(AgroClimateContext);
  if (!context) {
    throw new Error('useAgroClimate must be used within an AgroClimateProvider');
  }
  return context;
}
