import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { safeExtract, safeText, validateTextValue } from '../../utils/textUtils';
import { extractTemperatureData, extractWeatherCondition, extractWindData, isValidWeatherData } from '../../utils/weatherDataSafety';
import { SafeText } from '../SafeText';

// API key for OpenWeatherMap - replace with your own key from openweathermap.org
const API_KEY = '2d3163d491a8f6b2c97b6246750874da';

const WeatherScreen = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useCelsius, setUseCelsius] = useState(true);
  const [defaultLocation, setDefaultLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isSmallScreen = width < 350 || height < 600;
  // Get settings from AsyncStorage
  const getSettings = async () => {
    try {
      const storedUseCelsius = await AsyncStorage.getItem('useCelsius');
      const storedDefaultLocation = await AsyncStorage.getItem('defaultLocation');
      const storedSavedLocations = await AsyncStorage.getItem('savedLocations');
      
      if (storedUseCelsius !== null) {
        setUseCelsius(storedUseCelsius === 'true');
      }
      
      if (storedDefaultLocation !== null) {
        const defaultLoc = JSON.parse(storedDefaultLocation);
        setDefaultLocation(defaultLoc);
        setSelectedLocation(defaultLoc);
      }
      
      if (storedSavedLocations !== null) {
        setSavedLocations(JSON.parse(storedSavedLocations));
      }
    } catch (error) {
      console.error('Error getting settings:', error);
    }
  };// Fetch weather data based on location
  const fetchWeatherData = async (latitude, longitude) => {
    try {
      const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      console.log('Fetching weather from URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not OK:', response.status, errorText);
        throw new Error(`Weather data not available (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('Weather data received:', data);
      setWeatherData(data);
      
      // Fetch forecast data after getting current weather
      await fetchForecastData(latitude, longitude);
      
      setLoading(false);
    } catch (error) {
      setError(`Failed to fetch weather data: ${error.message}`);
      setLoading(false);
      console.error('Weather fetch error:', error);
    }
  };
  
  // Fetch hourly forecast data
  const fetchForecastData = async (latitude, longitude) => {
    try {
      // Using the 5-day/3-hour forecast as the hourly API requires a paid subscription
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      console.log('Fetching forecast from URL:', forecastUrl);
      
      const response = await fetch(forecastUrl);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Forecast API response not OK:', response.status, errorText);
        // We don't want to throw here as the main weather data might still be available
        console.error(`Forecast data not available (Status: ${response.status})`);
        return;
      }
      
      const data = await response.json();
      console.log('Forecast data received:', data);
      setForecastData(data);
    } catch (error) {
      console.error('Forecast fetch error:', error);
      // We don't set the main error state here as we still want to show the current weather
    }
  };  // Get user's current location or use default location
  const getLocation = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if a specific location is selected
      if (selectedLocation) {
        console.log('Using selected location:', selectedLocation);
        fetchWeatherData(selectedLocation.latitude, selectedLocation.longitude);
        return;
      }
      
      // Check if default location exists and should be used
      if (defaultLocation) {
        console.log('Using default location:', defaultLocation);
        fetchWeatherData(defaultLocation.latitude, defaultLocation.longitude);
        return;
      }
      
      // Get permission for location
      console.log('Requesting location permission...');
      let { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }
      
      // Get current location
      console.log('Getting current location...');
      let location = await Location.getCurrentPositionAsync({});
      console.log('Location received:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      fetchWeatherData(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      setError(`Could not get your location: ${error.message}`);
      setLoading(false);
      console.error('Location error:', error);
    }
  }, [selectedLocation, defaultLocation]); // Only include necessary dependencies

  // Change the selected location
  const changeLocation = (location) => {
    setSelectedLocation(location);
    setShowLocationMenu(false);
    setLoading(true);
    fetchWeatherData(location.latitude, location.longitude);
  };
  
  // Use current location
  const useCurrentLocation = async () => {
    try {
      setShowLocationMenu(false);
      setLoading(true);
      setSelectedLocation(null);
      
      // Get permission for location
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }
      
      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      fetchWeatherData(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      setError(`Could not get your location: ${error.message}`);
      setLoading(false);
      console.error('Location error:', error);
    }
  };  // Initial setup
  useEffect(() => {
    getSettings();

    // Remove any old console error overrides that might be causing issues
    const originalConsoleError = console.error;
    
    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  // Fetch weather when settings change
  useEffect(() => {
    getLocation();
  }, [defaultLocation, getLocation]);
  
  // Monitor AsyncStorage for changes in saved locations
  useEffect(() => {
    const checkSavedLocations = async () => {
      try {
        const storedSavedLocations = await AsyncStorage.getItem('savedLocations');
        if (storedSavedLocations !== null) {
          setSavedLocations(JSON.parse(storedSavedLocations));
        }
      } catch (error) {
        console.error('Error checking saved locations:', error);
      }
    };

    // Set up listener for app coming to foreground
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        checkSavedLocations();
      }
    });

    // Check initially and set up interval for periodic checks
    checkSavedLocations();
    const intervalId = setInterval(checkSavedLocations, 5000); // Check every 5 seconds

    // Clean up
    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, []);
  // Convert temperature
  const convertTemperature = (celsius) => {
    return useCelsius ? celsius : (celsius * 9/5) + 32;
  };  
  
  // Format temperature with unit
  const formatTemperature = (celsius) => {
    // Ensure celsius is a number to avoid type errors
    const celsiusValue = typeof celsius === 'number' ? celsius : 0;
    const temp = convertTemperature(celsiusValue);
    // Ensure we're returning a string with proper formatting
    const result = `${Math.round(temp)}°${useCelsius ? 'C' : 'F'}`;
    // Validate the result before returning
    validateTextValue(result, 'formatTemperature');
    return result;
  };// Get wind direction arrow
  const getWindDirectionArrow = (degrees) => {
    // Add extra safety by ensuring degrees is a number
    const rotationDegrees = typeof degrees === 'number' ? degrees : 0;
    
    return (
      <View style={{ transform: [{ rotate: `${rotationDegrees}deg` }] }}>
        <Ionicons 
          name="arrow-up" 
          size={24} 
          color="white" 
        />
      </View>
    );
  };  // Get wind speed from m/s to different units
  const getWindSpeed = (speedInMS) => {
    // Ensure speedInMS is a number
    const speed = typeof speedInMS === 'number' ? speedInMS : 0;
    
    // Beaufort scale calculation
    const beaufort = Math.round(Math.cbrt(Math.pow(speed / 0.836, 2)));
    
    // Knots calculation (1 m/s = 1.94384 knots)
    const knots = Math.round(speed * 1.94384);
    
    // km/h calculation (1 m/s = 3.6 km/h)
    const kmh = Math.round(speed * 3.6);
    
    return {
      beaufort: {
        value: beaufort,
        display: `${beaufort} Bft`
      },
      knots: {
        value: knots,
        display: `${knots} knots`
      },
      kmh: {
        value: kmh,
        display: `${kmh} km/h`
      },
      ms: {
        value: speed,
        display: `${speed} m/s`
      }
    };
  };
    // Get weather icon URL
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };
  
  // Format date for forecast
  const formatForecastDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      hour: date.getHours(),
      date: date.getDate(),
    };
  };
  
  // Toggle forecast visibility
  const toggleForecast = () => {
    setShowForecast(!showForecast);
  };  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#0096c7" />
        <SafeText style={styles.loadingText}>Loading weather data...</SafeText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="cloud-offline" size={64} color="#e63946" />
        <SafeText style={styles.errorText}>{error}</SafeText>
      </View>
    );
  }

  if (!weatherData) {
    return (
      <View style={styles.centeredContainer}>
        <SafeText style={styles.errorText}>No weather data available</SafeText>
      </View>
    );
  }
  // Calculate wind speed in different units
  const windSpeeds = getWindSpeed(safeExtract(weatherData, 'wind.speed', 0));

  // Check if the weather data is valid
  if (!isValidWeatherData(weatherData)) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="cloud-offline" size={64} color="#e63946" />
        <SafeText style={styles.errorText}>Invalid weather data received</SafeText>
      </View>
    );
  }

  // Extract temperature data using our safety utility
  const temperatureData = extractTemperatureData(weatherData);
  // Extract weather condition data
  const weatherCondition = extractWeatherCondition(weatherData);
  // Extract wind data
  const windData = extractWindData(weatherData);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={isLandscape ? styles.landscapeContent : styles.portraitContent}
    >      <View style={isLandscape ? styles.landscapeMainInfo : styles.mainInfo}>        <View style={styles.locationContainer}>
          <SafeText style={[styles.cityName, isSmallScreen && { fontSize: 22 }]}>
            {safeText(safeExtract(weatherData, 'name', '')) + 
             (safeExtract(weatherData, 'sys.country', '') ? ', ' + safeExtract(weatherData, 'sys.country', '') : '')}
          </SafeText>
          <TouchableOpacity 
            style={styles.locationButton}
            onPress={() => setShowLocationMenu(!showLocationMenu)}
          >
            <View style={styles.locationButtonContent}>
              <Ionicons name="location" size={20} color="white" />
              <SafeText style={styles.changeLocationText}>Change</SafeText>
            </View>
          </TouchableOpacity>
        </View>          {showLocationMenu && (
          <View style={styles.locationMenu}>            <View style={styles.locationMenuHeader}>
              <SafeText style={[styles.locationMenuTitle, isSmallScreen && { fontSize: 16 }]}>
                Choose Location
              </SafeText>
              <TouchableOpacity 
                style={styles.locationMenuCloseButton}
                onPress={() => setShowLocationMenu(false)}
              >
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.locationMenuScroll} 
              showsVerticalScrollIndicator={false}
              bounces={false}
              contentContainerStyle={{paddingVertical: 5}}
            >              <TouchableOpacity 
                style={[styles.locationMenuItem, !selectedLocation ? styles.activeLocationMenuItem : null]}
                onPress={useCurrentLocation}
              >
                <View style={styles.locationMenuItemIcon}>
                  <Ionicons name="navigate" size={20} color="#4cc9f0" />
                </View>
                <SafeText style={styles.locationMenuItemText}>Current Location</SafeText>
              </TouchableOpacity>
              
              {savedLocations.map((location, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.locationMenuItem,
                    selectedLocation && 
                    selectedLocation.latitude === location.latitude && 
                    selectedLocation.longitude === location.longitude ? 
                    styles.activeLocationMenuItem : null
                  ]}
                  onPress={() => changeLocation(location)}
                >                  <View style={styles.locationMenuItemIcon}>
                    <Ionicons 
                      name={
                        defaultLocation && 
                        defaultLocation.latitude === location.latitude && 
                        defaultLocation.longitude === location.longitude ? 
                        "star" : "location-outline"
                      } 
                      size={20} 
                      color="#4cc9f0" 
                    />
                  </View>
                  <SafeText style={styles.locationMenuItemText}>{location.name}</SafeText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}          <View style={styles.tempContainer}>          <Image
            style={[styles.weatherIcon, isSmallScreen && { width: 80, height: 80 }]}
            source={{ uri: getWeatherIconUrl(weatherCondition.icon) }}
          />
          <SafeText style={[styles.temperature, isSmallScreen && { fontSize: 38 }]}>
            {formatTemperature(temperatureData.current)}
          </SafeText>
        </View>
        
        <SafeText style={[styles.weatherDescription, isSmallScreen && { fontSize: 18 }]}>
          {weatherCondition.description}
        </SafeText>          <View style={styles.minMaxContainer}>
          <SafeText style={[styles.minMaxTemp, isSmallScreen && { fontSize: 14 }]}>
            {`Min: ${formatTemperature(temperatureData.min)}`}
          </SafeText>
          <SafeText style={[styles.minMaxTemp, isSmallScreen && { fontSize: 14 }]}>
            {`Max: ${formatTemperature(temperatureData.max)}`}
          </SafeText>        </View>
      </View>      <View style={isLandscape ? styles.landscapeDetailsContainer : styles.detailsContainer}>        <View style={[styles.detailCard, isSmallScreen && { padding: 10 }]}>
          <SafeText style={styles.detailTitle}>Wind</SafeText>          <View style={styles.windDirection}>
            {getWindDirectionArrow(windData.deg)}
            <SafeText style={[styles.detailValue, isSmallScreen && { fontSize: 16 }]}>
              {windSpeeds.beaufort.display}
            </SafeText>
          </View>
          <SafeText style={styles.detailSubvalue}>{windSpeeds.kmh.display}</SafeText>
          <SafeText style={styles.detailSubvalue}>{windSpeeds.knots.display}</SafeText>
        </View>
          <View style={[styles.detailCard, isSmallScreen && { padding: 10 }]}>
          <SafeText style={styles.detailTitle}>Pressure</SafeText>
          <SafeText style={[styles.detailValue, isSmallScreen && { fontSize: 16 }]}>
            {`${weatherData.main && typeof weatherData.main.pressure === 'number' ? weatherData.main.pressure : 0} hPa`}
          </SafeText>
        </View>
          <View style={[styles.detailCard, isSmallScreen && { padding: 10 }]}
          >
          <SafeText style={styles.detailTitle}>Humidity</SafeText>
          <SafeText style={[styles.detailValue, isSmallScreen && { fontSize: 16 }]}>
            {`${weatherData.main && typeof weatherData.main.humidity === 'number' ? weatherData.main.humidity : 0}%`}
          </SafeText>
        </View>
        
        <View style={[styles.detailCard, isSmallScreen && { padding: 10 }]}>
          <SafeText style={styles.detailTitle}>Feels Like</SafeText>
          <SafeText style={[styles.detailValue, isSmallScreen && { fontSize: 16 }]}>
            {formatTemperature(temperatureData.feelsLike)}
          </SafeText>
        </View></View>
        <View style={styles.forecastContainer}>
        <TouchableOpacity 
          style={styles.forecastToggle} 
          onPress={toggleForecast}
        >
          <SafeText style={[styles.forecastToggleText, isSmallScreen && { fontSize: 14 }]}>
            {showForecast ? 'Hide Forecast' : 'Show 5-Day Forecast'}
          </SafeText>
          <Ionicons 
            name={showForecast ? 'chevron-up' : 'chevron-down'} 
            size={24} 
            color="white"          />
        </TouchableOpacity>
        
        {showForecast && forecastData && (
          <View style={styles.forecastContent}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={forecastData.list.slice(0, 24)}
              keyExtractor={(item) => item.dt.toString()}
              renderItem={({ item }) => {
                const { time, hour } = formatForecastDate(item.dt);
                // Get appropriate background based on time of day
                let timeStyle = styles.dayTime;
                if (hour < 6 || hour >= 18) {
                  timeStyle = styles.nightTime;
                } else if (hour < 10 || hour >= 16) {
                  timeStyle = styles.morningEveningTime;
                }
                
                return (                  <View style={[
                    styles.forecastItem, 
                    timeStyle,
                    isSmallScreen && { minWidth: 90, padding: 8 }
                  ]}>                    <SafeText style={[styles.forecastTime, isSmallScreen && { fontSize: 12, marginBottom: 5 }]}>
                      {time}
                    </SafeText>                    <Image 
                      style={[styles.forecastIcon, isSmallScreen && { width: 40, height: 40, marginBottom: 3 }]}
                      source={{ uri: getWeatherIconUrl(item.weather && item.weather.length > 0 ? item.weather[0].icon : '01d') }}
                    />
                    <SafeText style={[styles.weatherCondition, isSmallScreen && { fontSize: 11, marginBottom: 3 }]}>
                      {item.weather && item.weather.length > 0 && item.weather[0].main ? item.weather[0].main : "Unknown"}
                    </SafeText>
                    <SafeText style={[styles.forecastTemp, isSmallScreen && { fontSize: 14, marginBottom: 5 }]}>
                      {formatTemperature(item.main && typeof item.main.temp === 'number' ? item.main.temp : 0)}
                    </SafeText>                    <View style={styles.forecastWindContainer}>
                      <View style={isSmallScreen && { transform: [{ scale: 0.8 }] }}>
                        {getWindDirectionArrow(item.wind && typeof item.wind.deg === 'number' ? item.wind.deg : 0)}
                      </View>
                      <SafeText style={[styles.forecastWind, isSmallScreen && { fontSize: 10 }]}>
                        {`${Math.round((item.wind && typeof item.wind.speed === 'number' ? item.wind.speed : 0) * 3.6)} km/h`}
                      </SafeText>
                    </View>
                  </View>
                );
              }}
            />            
            <SafeText style={[styles.forecastTitle, isSmallScreen && { fontSize: 18 }]}>
              5-Day Forecast
            </SafeText>
            
            {/* Group forecasts by day */}
            {forecastData.list.reduce((days, item) => {
              const { day, date } = formatForecastDate(item.dt);
              // Create unique day key
              const dayKey = `${day}-${date}`;
              
              // Skip if we already have this day in our accumulator or if it's today
              const today = new Date();
              const itemDate = new Date(item.dt * 1000);
              
              if (days.some(d => d.key === dayKey) || 
                  (today.getDate() === itemDate.getDate() && 
                   today.getMonth() === itemDate.getMonth() && 
                   today.getFullYear() === itemDate.getFullYear())) {
                return days;
              }
              
              // Find all entries for this day
              const dayEntries = forecastData.list.filter(entry => {
                const entryDate = formatForecastDate(entry.dt);
                const entryDayKey = `${entryDate.day}-${entryDate.date}`;
                return entryDayKey === dayKey;
              });
              
              // Calculate min/max temperatures and average condition for the day
              const temps = dayEntries.map(entry => entry.main.temp);
              const minTemp = Math.min(...temps);
              const maxTemp = Math.max(...temps);
                // Get the most common weather condition
              const weatherCounts = {};
              dayEntries.forEach(entry => {
                if (entry.weather && entry.weather.length > 0) {
                  const condition = entry.weather[0].main;
                  weatherCounts[condition] = (weatherCounts[condition] || 0) + 1;
                }
              });
              
              const mostCommonWeather = Object.entries(weatherCounts).length > 0 ? 
                Object.entries(weatherCounts).sort((a, b) => b[1] - a[1])[0][0] : 
                "Unknown";                // Get the icon for the most common weather during daytime
              const dayTimeEntry = dayEntries.find(entry => {
                const hour = formatForecastDate(entry.dt).hour;
                return hour >= 10 && hour <= 14 && entry.weather && entry.weather.length > 0;
              }) || dayEntries.find(entry => entry.weather && entry.weather.length > 0) || dayEntries[0] || {};
                
              // Safely extract weather icon with fallbacks at every step
              const weatherIcon = dayTimeEntry.weather && 
                                 dayTimeEntry.weather.length > 0 && 
                                 dayTimeEntry.weather[0] && 
                                 dayTimeEntry.weather[0].icon ? 
                                 dayTimeEntry.weather[0].icon : '01d';
                
              days.push({
                key: dayKey,
                day,
                date: itemDate,
                minTemp,
                maxTemp,
                weatherIcon: weatherIcon,
                weatherDesc: mostCommonWeather
              });
              
              return days;
            }, []).slice(0, 5).map(day => (              <View key={day.key} style={[styles.dailyForecastItem, isSmallScreen && { padding: 10 }]}>                <View style={styles.dailyForecastDayContainer}>
                  <SafeText style={[styles.dailyForecastDay, isSmallScreen && { fontSize: 14 }]}>
                    {`${day.day} ${day.date.getDate()}`}
                  </SafeText>
                </View>
                <View style={styles.dailyForecastWeatherContainer}>
                  <Image
                    style={[styles.dailyForecastIcon, isSmallScreen && { width: 36, height: 36 }]}
                    source={{ uri: getWeatherIconUrl(day.weatherIcon) }}
                  />
                  <SafeText style={[styles.dailyForecastDesc, isSmallScreen && { fontSize: 13 }]}>
                    {day.weatherDesc}
                  </SafeText>
                </View>
                <View style={[styles.dailyForecastTemp, isSmallScreen && { width: 130 }]}>
                  <SafeText style={[styles.dailyForecastTempMin, isSmallScreen && { fontSize: 13, width: 42 }]}>
                    {formatTemperature(day.minTemp)}
                  </SafeText>
                  <View style={styles.tempBar}>
                    <View style={styles.tempBarFill} />
                  </View>
                  <SafeText style={[styles.dailyForecastTempMax, isSmallScreen && { fontSize: 13, width: 42 }]}>
                    {formatTemperature(day.maxTemp)}
                  </SafeText>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },  portraitContent: {
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  landscapeContent: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  mainInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },  
  landscapeMainInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    position: 'relative',
    width: '100%',
    paddingHorizontal: 10,
  },
  locationButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(76, 201, 240, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  locationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeLocationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  locationMenu: {
    position: 'absolute',
    top: 60,
    right: 20,
    left: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.95)',
    borderRadius: 15,
    padding: 15,
    zIndex: 1000,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15,
  },
  locationMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  locationMenuTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  locationMenuCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationMenuScroll: {
    maxHeight: 230,
  },locationMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  activeLocationMenuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderLeftWidth: 3,
    borderLeftColor: '#4cc9f0',
  },
  locationMenuItemText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    fontWeight: '500',
  },
  locationMenuItemIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cityName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },  tempContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  weatherIcon: {
    width: 100,
    height: 100,
  },  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  weatherDescription: {
    fontSize: 20,
    color: 'white',
    textTransform: 'capitalize',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 10,
  },
  minMaxTemp: {
    fontSize: 16,
    color: 'white',
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  landscapeDetailsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'center',
  },  detailCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    width: '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailTitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    marginBottom: 8,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  detailSubvalue: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginTop: 5,
  },
  windDirection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
  },  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  forecastContainer: {
    marginTop: 10,
  },  forecastToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  forecastToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 10,
  },
  forecastContent: {
    marginBottom: 20,
  },  forecastItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 12,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dayTime: {
    backgroundColor: 'rgba(79, 172, 254, 0.4)',
  },
  nightTime: {
    backgroundColor: 'rgba(35, 61, 148, 0.4)',
  },
  morningEveningTime: {
    backgroundColor: 'rgba(173, 216, 230, 0.4)',
  },  forecastTime: {
    fontSize: 14,
    color: 'white',
    marginBottom: 6,
    fontWeight: 'bold',
  },
  forecastIcon: {
    width: 50,
    height: 50,
    marginBottom: 4,
  },forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  weatherCondition: {
    fontSize: 14,
    color: 'white',
    marginBottom: 5,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  forecastWindContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastWind: {
    fontSize: 12,
    color: 'white',
    marginLeft: 5,
  },
  forecastTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },  dailyForecastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  dailyForecastDayContainer: {
    width: 65,
  },
  dailyForecastWeatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  dailyForecastDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },  dailyForecastIcon: {
    width: 40,
    height: 40,
    marginRight: 5,
  },
  dailyForecastDesc: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
    textTransform: 'capitalize',
  },  dailyForecastTemp: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  dailyForecastTempMin: {
    fontSize: 14,
    color: 'white',
    width: 42,
    textAlign: 'right',
  },
  dailyForecastTempMax: {
    fontSize: 14,
    color: 'white',
    width: 42,
  },
  tempBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    width: 30,
    marginHorizontal: 3,
  },
  tempBarFill: {
    height: 4,
    backgroundColor: 'white',
    borderRadius: 2,
    width: '100%',
  },
});

export default WeatherScreen;
