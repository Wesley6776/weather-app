/**
 * Weather Data Safety - Utility functions to make sure weather data is safely accessed
 * and displayed in the application
 */

import { safeExtract } from './textUtils';

// Define interfaces for weather data
interface WeatherData {
  main?: {
    temp?: number;
    temp_min?: number;
    temp_max?: number;
    feels_like?: number;
    humidity?: number;
    pressure?: number;
  };
  weather?: Array<{
    main?: string;
    description?: string;
    icon?: string;
  }>;
  wind?: {
    speed?: number;
    deg?: number;
    gust?: number;
  };
  name?: string;
  sys?: {
    country?: string;
  };
}

interface TemperatureData {
  current: number;
  min: number;
  max: number;
  feelsLike: number;
}

interface WeatherCondition {
  main: string;
  description: string;
  icon: string;
}

interface WindData {
  speed: number;
  deg: number;
  gust: number;
}

/**
 * Checks if weather data contains the required fields and has valid format
 * @param data The weather data object to validate
 * @returns {boolean} true if data is valid, false otherwise
 */
export const isValidWeatherData = (data: WeatherData | null | undefined): boolean => {
  if (!data) return false;
  
  // Check for essential fields
  const hasMain = typeof data.main === 'object' && data.main !== null;
  const hasWeather = Array.isArray(data.weather) && data.weather.length > 0;
  const hasTemp = hasMain && typeof data.main?.temp === 'number';
  
  return hasMain && hasWeather && hasTemp;
};

/**
 * Safely extracts temperature data from weather object
 * @param data Weather data object
 * @returns {TemperatureData} Object with safely extracted temperature values
 */
export const extractTemperatureData = (data: WeatherData): TemperatureData => {
  return {
    current: safeExtract(data, 'main.temp', 0),
    min: safeExtract(data, 'main.temp_min', 0),
    max: safeExtract(data, 'main.temp_max', 0),
    feelsLike: safeExtract(data, 'main.feels_like', 0)
  };
};

/**
 * Safely extracts weather condition data
 * @param data Weather data object
 * @returns {WeatherCondition} Object with safely extracted weather condition data
 */
export const extractWeatherCondition = (data: WeatherData): WeatherCondition => {
  const weather = safeExtract(data, 'weather.0', {});
  
  return {
    main: safeExtract(weather, 'main', 'Unknown'),
    description: safeExtract(weather, 'description', 'Weather information unavailable'),
    icon: safeExtract(weather, 'icon', '01d')
  };
};

/**
 * Safely extracts wind data
 * @param data Weather data object
 * @returns {WindData} Object with safely extracted wind data
 */
export const extractWindData = (data: WeatherData): WindData => {
  return {
    speed: safeExtract(data, 'wind.speed', 0),
    deg: safeExtract(data, 'wind.deg', 0),
    gust: safeExtract(data, 'wind.gust', 0)
  };
};
