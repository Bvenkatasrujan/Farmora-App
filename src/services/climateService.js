/**
 * Climate Service using Open-Meteo API (No API key required for non-commercial use)
 * Supports Geocoding (City to Lat/Lon) and Weather Forecasting.
 */

export const climateService = {
  getWeather: async (city) => {
    try {
      // Clean and default city if invalid
      const queryCity = !city || city === 'Detecting Location...' ? 'Karnal' : city;
      
      // Check if city name is actually a coordinate pair (latitude, longitude)
      const coordRegex = /^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/;
      const coordMatch = queryCity.match(coordRegex);

      let latitude, longitude, name, country;

      if (coordMatch) {
        latitude = parseFloat(coordMatch[1]);
        longitude = parseFloat(coordMatch[2]);
        name = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        country = '';
      } else {
        // If query has commas (like "Karnal, Haryana"), split to get the city name
        const searchName = queryCity.includes(',') 
          ? queryCity.split(',')[0].trim() 
          : queryCity;

        let geoData = null;
        try {
          // 1. Geocoding: Get Lat/Lon for the city name
          const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchName)}&count=1&language=en&format=json`);
          geoData = await geoRes.json();
        } catch (fetchErr) {
          console.error("Geocoding fetch failed:", fetchErr);
        }

        if (geoData && geoData.results && geoData.results.length > 0) {
          const result = geoData.results[0];
          latitude = result.latitude;
          longitude = result.longitude;
          name = result.name;
          country = result.country;
        } else {
          // Fallback to default coordinates (Karnal, Haryana) if geocoding fails
          latitude = 29.6857;
          longitude = 76.9905;
          name = searchName || 'Karnal';
          country = 'India';
        }
      }

      // 2. Weather Forecast: Get current and daily data
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`);
      const weatherData = await weatherRes.json();

      // Open-Meteo uses WMO Weather interpretation codes
      const interpretWmoCode = (code) => {
        const codes = {
          0: 'Clear sky',
          1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
          45: 'Fog', 48: 'Depositing rime fog',
          51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
          61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
          71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow',
          77: 'Snow grains',
          80: 'Slight rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
          85: 'Slight snow showers', 86: 'Heavy snow showers',
          95: 'Thunderstorm', 96: 'Thunderstorm with slight hail', 99: 'Thunderstorm with heavy hail'
        };
        return codes[code] || 'Unknown';
      };

      // Process 7-day forecast
      const forecast = [];
      const daysCount = Math.min(7, weatherData.daily.time.length);
      for (let i = 0; i < daysCount; i++) {
        forecast.push({
          date: new Date(weatherData.daily.time[i]).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          temp: Math.round((weatherData.daily.temperature_2m_max[i] + weatherData.daily.temperature_2m_min[i]) / 2),
          tempMax: Math.round(weatherData.daily.temperature_2m_max[i]),
          tempMin: Math.round(weatherData.daily.temperature_2m_min[i]),
          description: interpretWmoCode(weatherData.daily.weather_code[i]),
          weatherCode: weatherData.daily.weather_code[i]
        });
      }

      return {
        temperature: Math.round(weatherData.current.temperature_2m),
        rainfall: weatherData.current.precipitation || 0,
        condition: interpretWmoCode(weatherData.daily.weather_code[0]),
        weatherCode: weatherData.daily.weather_code[0],
        humidity: weatherData.current.relative_humidity_2m,
        wind: Math.round(weatherData.current.wind_speed_10m),
        pressure: weatherData.current.surface_pressure,
        sunrise: new Date(weatherData.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sunset: new Date(weatherData.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aqi: 1,
        forecast: forecast,
        name: country ? `${name}, ${country}` : name
      };

    } catch (error) {
      console.error("Weather API Error:", error);
      throw error;
    }
  },

  getAIWeatherInsights: async (weatherData, forecastData) => {
    try {
      const forecastSummary = forecastData.map(f => `${f.date}: ${f.tempMax}°C/${f.tempMin}°C, ${f.description}`).join('; ');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an advanced AI Agricultural Meteorologist. Analyze the weather conditions and 7-day forecast to provide critical, actionable farm management insights. Format your response as a simple JSON object containing:\n{\n  "summary": "1-2 sentence overview of the weather trend and what it means for farmers",\n  "insights": [\n    {"title": "Actionable Tip 1", "desc": "Detailed description of irrigation, crop protection, or harvesting action"},\n    {"title": "Actionable Tip 2", "desc": "Detailed description of pesticide/fertilizer spraying advice"},\n    {"title": "Actionable Tip 3", "desc": "Detailed description of general crop or soil safety"}\n  ]\n}'
            },
            {
              role: 'user',
              content: `Location: ${weatherData.name}. Current Weather: ${weatherData.temperature}°C, ${weatherData.condition}, ${weatherData.humidity}% humidity, ${weatherData.wind} km/h wind speed. 7-Day Forecast: ${forecastSummary}.`
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error('Groq API Error');
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error) {
      console.error("AI Weather Insights Error:", error);
      // Fallback data
      return {
        summary: `Stable conditions expected in ${weatherData.name}. Perfect time to monitor crop watering and soil moisture.`,
        insights: [
          { title: "Irrigation Management", desc: `Maintain regular watering cycles based on the current temperature of ${weatherData.temperature}°C.` },
          { title: "Pesticide Spraying", desc: "Wind speeds are low, making it suitable for chemical applications if needed." },
          { title: "Soil Observation", desc: "Monitor soil moisture content closely as temperature shifts during the week." }
        ]
      };
    }
  }
};
