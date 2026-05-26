export interface ForecastDay {
  date: string;
  temp: number;
  tempMax: number;
  tempMin: number;
  description: string;
  weatherCode: number;
}

export interface ClimateData {
  temperature: number;
  rainfall: number;
  condition: string;
  weatherCode: number;
  humidity: number;
  wind: number;
  pressure: number;
  sunrise: string;
  sunset: string;
  aqi: number;
  forecast: ForecastDay[];
  name: string;
}

export interface WeatherAlert {
  id: string;
  type: 'rain' | 'spray' | 'heat' | 'wind' | 'generic';
  level: 'info' | 'warning' | 'danger';
  title: string;
  description: string;
}

export interface ClimateInsight {
  id: string;
  title: string;
  description: string;
  category: 'irrigation' | 'crop' | 'general';
  level: 'info' | 'warning' | 'success';
}
