import { ClimateData, ClimateInsight } from '../types/climate';
import { climateHelpers } from './climateHelpers';

export function getSprayWarning(data: ClimateData): ClimateInsight {
  const tomorrowForecast = data.forecast && data.forecast.length > 1 ? data.forecast[1] : null;
  const tomorrowRainProbability = tomorrowForecast 
    ? climateHelpers.getRainProbabilityByCode(tomorrowForecast.weatherCode) 
    : 0;

  // 1. High Wind Speed (> 25 km/h)
  if (data.wind > 25) {
    return {
      id: 'spray-wind-danger',
      title: 'Avoid Pesticide Spraying',
      description: `High wind speed detected (${data.wind} km/h). Pesticide or fertilizer spray will drift, wasting product and risking damage to surrounding crops.`,
      category: 'general',
      level: 'warning',
    };
  }

  // 2. High Humidity (> 80%)
  if (data.humidity > 80) {
    return {
      id: 'spray-humidity-warning',
      title: 'Avoid Pesticide Spraying',
      description: `Excessive humidity (${data.humidity}%) slows down chemical drying, which may lead to chemical wash-off or dilution. Delay spraying.`,
      category: 'general',
      level: 'warning',
    };
  }

  // 3. Rain expected (> 50%) or currently raining
  if (data.rainfall > 1 || tomorrowRainProbability > 50) {
    return {
      id: 'spray-rain-warning',
      title: 'Avoid Pesticide Spraying',
      description: `Precipitation expected tomorrow (probability ${Math.max(50, tomorrowRainProbability)}%). Delay spraying to ensure the chemicals are not washed off by rain.`,
      category: 'general',
      level: 'warning',
    };
  }

  // 4. Mild wind warnings (15-25 km/h)
  if (data.wind > 15) {
    return {
      id: 'spray-wind-caution',
      title: 'Pesticide Spray Caution',
      description: `Moderate winds (${data.wind} km/h). If spraying is necessary, use low-drift nozzles and spray early in the morning when wind is calmest.`,
      category: 'general',
      level: 'info',
    };
  }

  // 5. Perfect conditions
  return {
    id: 'spray-good',
    title: 'Ideal Spraying Conditions',
    description: `Optimal weather window. Wind is calm (${data.wind} km/h) and humidity is balanced (${data.humidity}%). Pesticides and foliar sprays will adhere perfectly.`,
    category: 'general',
    level: 'success',
  };
}
