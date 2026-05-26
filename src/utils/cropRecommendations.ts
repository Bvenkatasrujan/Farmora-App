import { ClimateData, ClimateInsight } from '../types/climate';
import { climateHelpers } from './climateHelpers';


export function getCropRecommendations(data: ClimateData, selectedCrop: string = 'Rice'): ClimateInsight[] {
  const recommendations: ClimateInsight[] = [];
  const crop = (selectedCrop || 'Rice').toLowerCase();

  // Rice advisory
  if (crop === 'rice') {
    if (data.temperature > 35) {
      recommendations.push({
        id: 'crop-rice-heat',
        title: 'Rice Water Level Management',
        description: `High temperature (${data.temperature}°C) causes high evaporation. Maintain standing water of 2-5 cm in the rice fields to prevent soil cracking.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (data.humidity > 80) {
      recommendations.push({
        id: 'crop-rice-disease',
        title: 'Fungal Blast Disease Risk',
        description: `High relative humidity (${data.humidity}%) is highly conducive to Rice blast. Inspect lower leaves for spindle-shaped brown spots.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (data.rainfall > 3) {
      recommendations.push({
        id: 'crop-rice-drain',
        title: 'Drainage Alert',
        description: 'Ensure fields have adequate drainage. While rice likes water, submerging young tillers completely for more than 4 days causes rot.',
        category: 'crop',
        level: 'info',
      });
    }
    // Default optimal message
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'crop-rice-good',
        title: 'Optimal Rice Growth Conditions',
        description: 'Current weather parameters are ideal for rice growth. Keep monitoring field water levels.',
        category: 'crop',
        level: 'success',
      });
    }
  }

  // Wheat advisory
  else if (crop === 'wheat') {
    if (data.temperature > 30) {
      recommendations.push({
        id: 'crop-wheat-heat',
        title: 'Heat Stress Warning',
        description: `Wheat requires a cooler temperature. The current temperature of ${data.temperature}°C might trigger early spike development. Irrigate in the evening to cool the crop.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (data.humidity > 80) {
      recommendations.push({
        id: 'crop-wheat-rust',
        title: 'Wheat Rust Disease Warning',
        description: `High humidity (${data.humidity}%) and warm weather can trigger Yellow Rust outbreaks. Inspect crop rows regularly.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (data.temperature >= 10 && data.temperature <= 22) {
      recommendations.push({
        id: 'crop-wheat-tillering',
        title: 'Optimal Tillering Temperature',
        description: `Current cool conditions (${data.temperature}°C) are excellent for wheat tillering. Apply first nitrogen dosage (urea) if sowing was 21-25 days ago.`,
        category: 'crop',
        level: 'success',
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'crop-wheat-normal',
        title: 'Wheat Field Care',
        description: 'Conditions are stable for wheat. Maintain optimal soil moisture for spike development.',
        category: 'crop',
        level: 'success',
      });
    }
  }

  // Tomato advisory
  else if (crop === 'tomato') {
    if (data.humidity > 75) {
      recommendations.push({
        id: 'crop-tomato-fungal',
        title: 'Tomato Fungal Disease Warning',
        description: `High humidity (${data.humidity}%) may increase fungal disease risk (Early/Late Blight) in tomato crops. Apply preventive organic copper-based sprays.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (data.temperature > 35) {
      recommendations.push({
        id: 'crop-tomato-flower-drop',
        title: 'Flower Drop Alert',
        description: `Extreme temperature (${data.temperature}°C) may cause tomato flower drop and poor pollination. Maintain soil moisture and consider light mulching to protect roots.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'crop-tomato-normal',
        title: 'Tomato Crop Monitoring',
        description: 'Weather conditions are favorable. Ensure plants are staked properly to keep leaves off damp soil.',
        category: 'crop',
        level: 'success',
      });
    }
  }

  // Maize advisory
  else if (crop === 'maize') {
    if (data.temperature > 35) {
      recommendations.push({
        id: 'crop-maize-pollination',
        title: 'Maize Pollination Stress',
        description: `High temperature (${data.temperature}°C) during pollination can desiccate pollen. Keep soil moist to ensure successful grain filling.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (data.forecast && data.forecast.length > 1 && climateHelpers.getRainProbabilityByCode(data.forecast[1].weatherCode) > 60) {
      recommendations.push({
        id: 'crop-maize-fertilizer',
        title: 'Fertilization Delay Recommended',
        description: 'Rain expected tomorrow. Postpone urea top-dressing in Maize to prevent nitrogen leaching and run-off.',
        category: 'crop',
        level: 'warning',
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'crop-maize-normal',
        title: 'Maize Crop Condition',
        description: 'Stable weather detected. Standard vegetative growth conditions for Maize.',
        category: 'crop',
        level: 'success',
      });
    }
  }

  // Cotton or default advisory
  else {
    if (data.humidity > 80) {
      recommendations.push({
        id: 'crop-generic-humidity',
        title: 'Boll Rot & Fungal Risk',
        description: `High humidity (${data.humidity}%) increases risk of boll rot or damping off. Ensure weed-free fields to improve crop ventilation.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (data.wind > 20) {
      recommendations.push({
        id: 'crop-generic-wind',
        title: 'Crop Lodging Risk',
        description: `Wind speed of ${data.wind} km/h can bend taller plants. Avoid excessive irrigation that softens soil, as it makes plants prone to lodging.`,
        category: 'crop',
        level: 'warning',
      });
    }
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'crop-generic-normal',
        title: 'Crop Climate Outlook',
        description: `Conditions are stable for ${selectedCrop || 'your crop'}. Standard crop management tasks can proceed.`,
        category: 'crop',
        level: 'success',
      });
    }
  }

  return recommendations;
}
