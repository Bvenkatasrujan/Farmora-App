import { ClimateData, WeatherAlert } from '../types/climate';
import { climateHelpers } from './climateHelpers';

export function getWeatherAlerts(data: ClimateData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  // 1. Extreme Heat Alert (> 38°C)
  if (data.temperature > 38) {
    alerts.push({
      id: 'heat-alert',
      type: 'heat',
      level: 'danger',
      title: 'Extreme Heat Detected',
      description: `Temperature is extremely high (${data.temperature}°C). Secure shade for livestock and increase irrigation. Avoid manual field work during peak afternoon hours.`,
    });
  }

  // 2. High Wind Alert (> 25 km/h)
  if (data.wind > 25) {
    alerts.push({
      id: 'wind-alert',
      type: 'wind',
      level: 'danger',
      title: 'High Wind Detected',
      description: `Wind speed is ${data.wind} km/h. Strictly avoid pesticide or foliar fertilizer spraying to prevent chemical drift and ensure coverage.`,
    });
  }

  // 3. Rain Expected Alert
  // Let's check tomorrow's forecast (index 1 of the forecast array if it exists)
  if (data.forecast && data.forecast.length > 1) {
    const tomorrow = data.forecast[1];
    const tomorrowRainProb = climateHelpers.getRainProbabilityByCode(tomorrow.weatherCode);

    if (tomorrowRainProb > 60) {
      alerts.push({
        id: 'rain-alert-tomorrow',
        type: 'rain',
        level: 'warning',
        title: 'Rain Expected Tomorrow',
        description: `High chance of rain (${tomorrowRainProb}%) is forecast for tomorrow. Postpone pesticide applications, adjust your irrigation schedule, and cover open harvest stock.`,
      });
    }
  }

  // 4. Current Heavy Rain Alert
  const currentRainProb = climateHelpers.getRainProbabilityByCode(data.weatherCode);
  if (data.rainfall > 5 || currentRainProb >= 85) {
    alerts.push({
      id: 'current-rain-alert',
      type: 'rain',
      level: 'warning',
      title: 'Heavy Rainfall Warning',
      description: `Active wet conditions detected. Avoid chemical spray and ensure field drainage channels are clear to prevent waterlogging.`,
    });
  }

  // 5. Thunderstorm Alert (WMO Codes 95, 96, 99)
  if (data.weatherCode === 95 || data.weatherCode === 96 || data.weatherCode === 99) {
    alerts.push({
      id: 'thunderstorm-alert',
      type: 'generic',
      level: 'danger',
      title: 'Active Thunderstorm Warning',
      description: 'Severe thunderstorm in progress. Avoid open fields, metal tools, and farm machinery. Ensure livestock are safely sheltered.',
    });
  }

  // 6. Frost Risk Alert (< 5°C)
  if (data.temperature < 5) {
    alerts.push({
      id: 'frost-alert',
      type: 'generic',
      level: 'warning',
      title: 'Frost Risk Warning',
      description: `Low temperature (${data.temperature}°C) detected. Apply light irrigation tonight to protect sensitive crops from frost damage.`,
    });
  }

  return alerts;
}
