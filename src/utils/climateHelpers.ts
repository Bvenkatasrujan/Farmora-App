import { Cloud, Sun, CloudRain, CloudSnow, Wind, Droplets, Thermometer, HelpCircle } from 'lucide-react-native';

export const climateHelpers = {
  getWmoIcon: (code: number) => {
    // Map WMO codes to Lucide icons
    if (code === 0) return Sun;
    if (code >= 1 && code <= 3) return Cloud;
    if (code === 45 || code === 48) return Cloud; // Fog
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return CloudRain;
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return CloudSnow;
    if (code >= 95 && code <= 99) return CloudRain; // Thunderstorm
    return HelpCircle;
  },

  getWmoColor: (code: number) => {
    if (code === 0) return '#eab308'; // Yellow for sun
    if (code >= 1 && code <= 3) return '#38bdf8'; // Sky blue for cloud
    if (code === 45 || code === 48) return '#94a3b8'; // Slate for fog
    if ((code >= 51 && code <= 65) || (code >= 80 && code <= 82)) return '#60a5fa'; // Blue for rain
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '#cbd5e1'; // Light slate for snow
    if (code >= 95 && code <= 99) return '#3b82f6'; // Darker blue for thunderstorm
    return '#64748B';
  },

  getRainProbabilityByCode: (code: number): number => {
    // WMO Weather interpretation codes mapping to rain probability
    if (code === 0) return 0; // Clear
    if (code === 1) return 10; // Mainly clear
    if (code === 2) return 30; // Partly cloudy
    if (code === 3) return 40; // Overcast
    if (code === 45 || code === 48) return 15; // Fog
    if (code === 51 || code === 53 || code === 55) return 60; // Drizzle
    if (code === 61 || code === 63 || code === 65) return 90; // Rain
    if (code === 80 || code === 81 || code === 82) return 85; // Rain showers
    if (code === 95 || code === 96 || code === 99) return 95; // Thunderstorm
    return 20;
  }
};
