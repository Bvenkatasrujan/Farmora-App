import { ClimateData, ClimateInsight } from '../types/climate';
import { climateHelpers } from './climateHelpers';

export function getIrrigationAdvice(data: ClimateData): ClimateInsight {
  const tomorrowForecast = data.forecast && data.forecast.length > 1 ? data.forecast[1] : null;
  const tomorrowRainProbability = tomorrowForecast 
    ? climateHelpers.getRainProbabilityByCode(tomorrowForecast.weatherCode) 
    : 0;

  // 1. Heavy rainfall or rain expected
  if (data.rainfall > 3 || tomorrowRainProbability > 50) {
    return {
      id: 'irrigation-reduce',
      title: 'Reduce Irrigation Today',
      description: `Natural rainfall is expected (probability ${Math.max(50, tomorrowRainProbability)}%). Suspend or significantly reduce irrigation to prevent waterlogging and root rot.`,
      category: 'irrigation',
      level: 'warning',
    };
  }

  // 2. Extreme Heat
  if (data.temperature > 35) {
    return {
      id: 'irrigation-increase',
      title: 'Increase Irrigation',
      description: `High evapotranspiration risk under extreme heat (${data.temperature}°C). Apply additional watering during early morning or evening hours to reduce water stress on crops.`,
      category: 'irrigation',
      level: 'warning',
    };
  }

  // 3. High Humidity
  if (data.humidity > 80) {
    return {
      id: 'irrigation-humidity',
      title: 'Reduce Watering Volume',
      description: `High air humidity (${data.humidity}%) reduces crop water transpiration. Irrigate lightly and check soil moisture first to avoid damp roots.`,
      category: 'irrigation',
      level: 'info',
    };
  }

  // 4. Default stable conditions
  return {
    id: 'irrigation-stable',
    title: 'Normal Irrigation Schedule',
    description: `Current conditions are stable (Temp: ${data.temperature}°C, Humidity: ${data.humidity}%). Maintain your standard crop water schedule.`,
    category: 'irrigation',
    level: 'success',
  };
}
