import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';

const SettingsScreen = () => {
  const [useCelsius, setUseCelsius] = useState(true);
  const [locationName, setLocationName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [defaultLocation, setDefaultLocation] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  // SETUP AND EFFECTS
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedUseCelsius = await AsyncStorage.getItem('useCelsius');
        const storedDefaultLocation = await AsyncStorage.getItem('defaultLocation');
        const storedSavedLocations = await AsyncStorage.getItem('savedLocations');
        
        if (storedUseCelsius !== null) {
          setUseCelsius(storedUseCelsius === 'true');
        }
        
        if (storedDefaultLocation !== null) {
          const location = JSON.parse(storedDefaultLocation);
          setDefaultLocation(location);
          setLocationName(location.name || '');
          setLatitude(location.latitude.toString());
          setLongitude(location.longitude.toString());
        }
        
        if (storedSavedLocations !== null) {
          setSavedLocations(JSON.parse(storedSavedLocations));
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        Alert.alert('Error', 'Failed to load settings');
      }
    };
    
    loadSettings();
  }, []);

  // SETTINGS FUNCTIONS
  const toggleTemperatureUnit = async (value) => {
    try {
      setUseCelsius(value);
      await AsyncStorage.setItem('useCelsius', value.toString());
    } catch (error) {
      console.error('Error saving temperature unit:', error);
      Alert.alert('Error', 'Failed to save temperature unit setting');
    }
  };

  const saveDefaultLocation = async () => {
    try {
      if (!latitude || !longitude) {
        Alert.alert('Error', 'Latitude and longitude are required');
        return;
      }
      
      const numLat = parseFloat(latitude);
      const numLon = parseFloat(longitude);
      
      if (isNaN(numLat) || isNaN(numLon)) {
        Alert.alert('Error', 'Latitude and longitude must be numbers');
        return;
      }
      
      const location = {
        name: locationName,
        latitude: numLat,
        longitude: numLon
      };
      
      await AsyncStorage.setItem('defaultLocation', JSON.stringify(location));
      setDefaultLocation(location);
      
      const locationExists = savedLocations.some(
        loc => loc.latitude === numLat && loc.longitude === numLon
      );
      
      if (!locationExists) {
        const updatedLocations = [...savedLocations, location];
        setSavedLocations(updatedLocations);
        await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      }
      
      Alert.alert('Success', 'Default location saved successfully');
    } catch (error) {
      console.error('Error saving default location:', error);
      Alert.alert('Error', 'Failed to save default location');
    }
  };
  
  // LOCATION SEARCH FUNCTIONS
  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a location to search');
      return;
    }
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      const geocodedLocations = await Location.geocodeAsync(searchQuery);
      
      if (geocodedLocations.length === 0) {
        Alert.alert('No Results', 'No locations found for your search query');
        setIsSearching(false);
        return;
      }
      
      const detailedResults = await Promise.all(
        geocodedLocations.slice(0, 5).map(async (location) => {
          const { latitude, longitude } = location;
          const reverseGeocode = await Location.reverseGeocodeAsync({ latitude, longitude });
          
          let name = searchQuery;
          if (reverseGeocode.length > 0) {
            const { city, region, country, street } = reverseGeocode[0];
            name = [city, region, country].filter(Boolean).join(', ');
            if (!name && street) name = street;
            if (!name) name = searchQuery;
          }
          
          return {
            name,
            latitude,
            longitude
          };
        })
      );
      
      setSearchResults(detailedResults);
    } catch (error) {
      console.error('Error searching for location:', error);
      Alert.alert('Error', 'Failed to search for location');
    } finally {
      setIsSearching(false);
    }
  };
  
  const selectSearchResult = (location) => {
    setLocationName(location.name);
    setLatitude(location.latitude.toString());
    setLongitude(location.longitude.toString());
    setShowSearchModal(false);
  };
  
  // LOCATION MANAGEMENT FUNCTIONS
  const saveLocation = async () => {
    try {
      if (!latitude || !longitude) {
        Alert.alert('Error', 'Latitude and longitude are required');
        return;
      }
      
      const numLat = parseFloat(latitude);
      const numLon = parseFloat(longitude);
      
      if (isNaN(numLat) || isNaN(numLon)) {
        Alert.alert('Error', 'Latitude and longitude must be numbers');
        return;
      }
      
      const location = {
        name: locationName,
        latitude: numLat,
        longitude: numLon
      };
      
      const locationExists = savedLocations.some(
        loc => loc.latitude === numLat && loc.longitude === numLon
      );
      
      if (locationExists) {
        Alert.alert('Location Exists', 'This location is already saved');
        return;
      }
      
      const updatedLocations = [...savedLocations, location];
      setSavedLocations(updatedLocations);
      await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      
      Alert.alert('Success', 'Location saved successfully');
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location');
    }
  };
  
  const setAsDefault = async (location) => {
    try {
      await AsyncStorage.setItem('defaultLocation', JSON.stringify(location));
      setDefaultLocation(location);
      setLocationName(location.name);
      setLatitude(location.latitude.toString());
      setLongitude(location.longitude.toString());
      Alert.alert('Success', `${location.name} set as default location`);
    } catch (error) {
      console.error('Error setting default location:', error);
      Alert.alert('Error', 'Failed to set default location');
    }
  };
  
  const deleteLocation = async (location) => {
    try {
      const updatedLocations = savedLocations.filter(
        loc => !(loc.latitude === location.latitude && loc.longitude === location.longitude)
      );
      
      setSavedLocations(updatedLocations);
      await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
      
      if (defaultLocation && 
          defaultLocation.latitude === location.latitude && 
          defaultLocation.longitude === location.longitude) {
        await AsyncStorage.removeItem('defaultLocation');
        setDefaultLocation(null);
        setLocationName('');
        setLatitude('');
        setLongitude('');
        Alert.alert('Notice', 'Default location has been cleared');
      } else {
        Alert.alert('Success', 'Location deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      Alert.alert('Error', 'Failed to delete location');
    }
  };

  const useCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Error', 'Permission to access location was denied');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });
      
      let locationName = 'Current Location';
      if (geocode.length > 0) {
        const { city, region, country } = geocode[0];
        locationName = city || region || country || locationName;
      }
      
      setLatitude(latitude.toString());
      setLongitude(longitude.toString());
      setLocationName(locationName);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const clearDefaultLocation = async () => {
    try {
      await AsyncStorage.removeItem('defaultLocation');
      setDefaultLocation(null);
      setLocationName('');
      setLatitude('');
      setLongitude('');
      Alert.alert('Success', 'Default location cleared');
    } catch (error) {
      console.error('Error clearing default location:', error);
      Alert.alert('Error', 'Failed to clear default location');
    }
  };

  // RENDER
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={isLandscape ? styles.landscapeContent : styles.content}>
        <Text style={styles.title}>Settings</Text>
        
        {isLandscape ? (
          // LANDSCAPE LAYOUT
          <>
            <View style={styles.landscapeLeftColumn}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Temperature Unit</Text>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>Fahrenheit</Text>
                  <Switch
                    value={useCelsius}
                    onValueChange={toggleTemperatureUnit}
                    trackColor={{ false: '#767577', true: '#81b0ff' }}
                    thumbColor={useCelsius ? '#0096c7' : '#f4f3f4'}
                  />
                  <Text style={styles.toggleLabel}>Celsius</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Location Settings</Text>
                
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => setShowSearchModal(true)}
                >
                  <Ionicons name="search" size={20} color="white" />
                  <Text style={styles.buttonText}>Search for a City</Text>
                </TouchableOpacity>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Location Name</Text>
                  <TextInput
                    style={styles.input}
                    value={locationName}
                    onChangeText={setLocationName}
                    placeholder="Enter location name"
                    placeholderTextColor="#aaa"
                  />
                </View>
                
                <View style={styles.coordinatesContainer}>
                  <View style={styles.coordinateInput}>
                    <Text style={styles.label}>Latitude</Text>
                    <TextInput
                      style={styles.input}
                      value={latitude}
                      onChangeText={setLatitude}
                      placeholder="Latitude"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.coordinateInput}>
                    <Text style={styles.label}>Longitude</Text>
                    <TextInput
                      style={styles.input}
                      value={longitude}
                      onChangeText={setLongitude}
                      placeholder="Longitude"
                      placeholderTextColor="#aaa"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.landscapeRightColumn}>
              <View style={styles.card}>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.getCurrentButton]}
                    onPress={useCurrentLocation}
                  >
                    <Ionicons name="locate" size={20} color="white" />
                    <Text style={styles.buttonText}>Use Current</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={saveLocation}
                  >
                    <Ionicons name="add-circle" size={20} color="white" />
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.button, styles.defaultButton]}
                    onPress={saveDefaultLocation}
                  >
                    <Ionicons name="star" size={20} color="white" />
                    <Text style={styles.buttonText}>Set Default</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {savedLocations.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>Saved Locations</Text>
                  
                  {savedLocations.map((location, index) => (
                    <View key={index} style={styles.savedLocationItem}>
                      <View style={styles.locationInfo}>
                        <Text style={styles.locationName}>{location.name}</Text>
                        <Text style={styles.locationCoords}>
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </Text>
                        {defaultLocation && 
                          defaultLocation.latitude === location.latitude && 
                          defaultLocation.longitude === location.longitude && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Default</Text>
                          </View>
                        )}
                      </View>
                      
                      <View style={styles.locationActions}>
                        <TouchableOpacity
                          style={styles.locationButton}
                          onPress={() => setAsDefault(location)}
                        >
                          <Ionicons name="star" size={20} color="white" />
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={[styles.locationButton, styles.deleteButton]}
                          onPress={() => deleteLocation(location)}
                        >
                          <Ionicons name="trash" size={20} color="white" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                  
                  {defaultLocation && (
                    <TouchableOpacity
                      style={[styles.button, styles.clearButton]}
                      onPress={clearDefaultLocation}
                    >
                      <Ionicons name="trash" size={20} color="white" />
                      <Text style={styles.buttonText}>Clear Default Location</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </>
        ) : (
          // PORTRAIT LAYOUT
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Temperature Unit</Text>
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Fahrenheit</Text>
                <Switch
                  value={useCelsius}
                  onValueChange={toggleTemperatureUnit}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={useCelsius ? '#0096c7' : '#f4f3f4'}
                />
                <Text style={styles.toggleLabel}>Celsius</Text>
              </View>
            </View>
            
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Location Settings</Text>
              
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearchModal(true)}
              >
                <Ionicons name="search" size={20} color="white" />
                <Text style={styles.buttonText}>Search for a City</Text>
              </TouchableOpacity>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Location Name</Text>
                <TextInput
                  style={styles.input}
                  value={locationName}
                  onChangeText={setLocationName}
                  placeholder="Enter location name"
                  placeholderTextColor="#aaa"
                />
              </View>
              
              <View style={styles.coordinatesContainer}>
                <View style={styles.coordinateInput}>
                  <Text style={styles.label}>Latitude</Text>
                  <TextInput
                    style={styles.input}
                    value={latitude}
                    onChangeText={setLatitude}
                    placeholder="Latitude"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={styles.coordinateInput}>
                  <Text style={styles.label}>Longitude</Text>
                  <TextInput
                    style={styles.input}
                    value={longitude}
                    onChangeText={setLongitude}
                    placeholder="Longitude"
                    placeholderTextColor="#aaa"
                    keyboardType="numeric"
                  />
                </View>
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.getCurrentButton]}
                  onPress={useCurrentLocation}
                >
                  <Ionicons name="locate" size={20} color="white" />
                  <Text style={styles.buttonText}>Use Current</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={saveLocation}
                >
                  <Ionicons name="add-circle" size={20} color="white" />
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.button, styles.defaultButton]}
                  onPress={saveDefaultLocation}
                >
                  <Ionicons name="star" size={20} color="white" />
                  <Text style={styles.buttonText}>Set Default</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {savedLocations.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Saved Locations</Text>
                
                {savedLocations.map((location, index) => (
                  <View key={index} style={styles.savedLocationItem}>
                    <View style={styles.locationInfo}>
                      <Text style={styles.locationName}>{location.name}</Text>
                      <Text style={styles.locationCoords}>
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </Text>
                      {defaultLocation && 
                        defaultLocation.latitude === location.latitude && 
                        defaultLocation.longitude === location.longitude && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.locationActions}>
                      <TouchableOpacity
                        style={styles.locationButton}
                        onPress={() => setAsDefault(location)}
                      >
                        <Ionicons name="star" size={20} color="white" />
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[styles.locationButton, styles.deleteButton]}
                        onPress={() => deleteLocation(location)}
                      >
                        <Ionicons name="trash" size={20} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                
                {defaultLocation && (
                  <TouchableOpacity
                    style={[styles.button, styles.clearButton]}
                    onPress={clearDefaultLocation}
                  >
                    <Ionicons name="trash" size={20} color="white" />
                    <Text style={styles.buttonText}>Clear Default Location</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
      
      {/* SEARCH MODAL */}
      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Search for a Location</Text>
            
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Enter city name"
                placeholderTextColor="#aaa"
                autoFocus={true}
              />
              
              <TouchableOpacity
                style={styles.searchActionButton}
                onPress={searchLocation}
                disabled={isSearching}
              >
                <Ionicons name="search" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            {isSearching ? (
              <View style={styles.searchingContainer}>
                <ActivityIndicator size="large" color="#0096c7" />
                <Text style={styles.searchingText}>Searching...</Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                keyExtractor={(item, index) => index.toString()}
                style={styles.resultsList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.resultItem}
                    onPress={() => selectSearchResult(item)}
                  >
                    <Ionicons name="location" size={24} color="#4cc9f0" />
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultName}>{item.name}</Text>
                      <Text style={styles.resultCoords}>
                        {item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={styles.noResultsText}>
                    {searchQuery.trim() ? 'No results found. Try a different search term.' : 'Enter a city name to search'}
                  </Text>
                }
              />
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSearchModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  landscapeContent: {
    padding: 20,
    paddingTop: 20,
    flexDirection: 'row',
  },
  landscapeLeftColumn: {
    flex: 1,
    paddingRight: 10,
  },
  landscapeRightColumn: {
    flex: 1,
    paddingLeft: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
  },
  toggleLabel: {
    fontSize: 16,
    color: 'white',
    marginHorizontal: 10,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  coordinateInput: {
    width: '48%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 5,
  },
  getCurrentButton: {
    backgroundColor: '#4361ee',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4cc9f0',
    flex: 1,
  },
  defaultButton: {
    backgroundColor: '#f72585',
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#e63946',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    flexDirection: 'row',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: '#4361ee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },  savedLocationItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationInfo: {
    flex: 1,
    paddingRight: 10,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  locationCoords: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  locationActions: {
    flexDirection: 'row',
  },  locationButton: {
    backgroundColor: '#4cc9f0',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  deleteButton: {
    backgroundColor: '#e63946',
  },
  defaultBadge: {
    backgroundColor: '#f72585',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  defaultBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1e3a8a',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
    flex: 1,
    marginRight: 10,
  },
  searchActionButton: {
    backgroundColor: '#4361ee',
    width: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  resultTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  resultCoords: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  noResultsText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 20,
  },
  closeButton: {
    backgroundColor: '#4361ee',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  searchingText: {
    fontSize: 16,
    color: 'white',
    marginTop: 10,
  },
});

export default SettingsScreen;
