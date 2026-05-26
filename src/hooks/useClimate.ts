import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { climateService } from '../services/climateService';
import { ClimateData, WeatherAlert, ClimateInsight } from '../types/climate';
import { CLIMATE_CONFIG } from '../constants/climateConfig';
import { getWeatherAlerts } from '../utils/weatherAlerts';
import { getIrrigationAdvice } from '../utils/irrigationAdvisor';
import { getSprayWarning } from '../utils/sprayWarnings';
import { getCropRecommendations } from '../utils/cropRecommendations';

// Simple in-memory cache to prevent repeated API hits
interface CacheEntry {
  data: ClimateData;
  timestamp: number;
}
const climateCache: Record<string, CacheEntry> = {};

export function useClimate(customLocation?: string) {
  const storeLocationName = useAppStore((state) => state.locationName);
  const selectedCrop = useAppStore((state) => state.selectedCrop);

  // Determine query location
  const location = customLocation || storeLocationName;

  const [weatherData, setWeatherData] = useState<ClimateData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (force = false) => {
    // If location is not set or in a placeholder state, use default fallback
    const targetLocation = !location || location === 'Detecting Location...' 
      ? CLIMATE_CONFIG.DEFAULT_LOCATION 
      : location;

    // Check cache
    const cacheKey = targetLocation.toLowerCase().trim();
    const cachedEntry = climateCache[cacheKey];
    const now = Date.now();

    if (!force && cachedEntry && (now - cachedEntry.timestamp < CLIMATE_CONFIG.CACHE_DURATION_MS)) {
      setWeatherData(cachedEntry.data);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await climateService.getWeather(targetLocation);
      
      // Update cache
      climateCache[cacheKey] = {
        data,
        timestamp: Date.now(),
      };
      
      setWeatherData(data);
    } catch (err: any) {
      console.error('Error fetching climate data:', err);
      
      // If there is cached data, fall back to it even if expired, instead of showing error
      if (cachedEntry) {
        setWeatherData(cachedEntry.data);
        setError('Could not refresh weather, showing cached data.');
      } else {
        setError('Failed to fetch weather data. Check your internet connection.');
      }
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  // Memoized alerts calculation
  const alerts = useMemo<WeatherAlert[]>(() => {
    if (!weatherData) return [];
    return getWeatherAlerts(weatherData);
  }, [weatherData]);

  // Memoized crop and farming recommendations
  const recommendations = useMemo<ClimateInsight[]>(() => {
    if (!weatherData) return [];
    const insights: ClimateInsight[] = [];
    
    // 1. Add Irrigation advisory
    insights.push(getIrrigationAdvice(weatherData));
    
    // 2. Add Spray advisory
    insights.push(getSprayWarning(weatherData));
    
    // 3. Add Crop Specific recommendations
    const cropRecs = getCropRecommendations(weatherData, selectedCrop);
    insights.push(...cropRecs);

    return insights;
  }, [weatherData, selectedCrop]);

  return {
    currentWeather: weatherData,
    forecast: weatherData?.forecast || [],
    alerts,
    recommendations,
    loading,
    error,
    refresh: () => fetchWeather(true),
  };
}
