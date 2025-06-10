import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from 'react-native';

const AboutScreen = () => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const currentYear = new Date().getFullYear();

  return (
    <ScrollView style={styles.container}>      
      <View style={isLandscape ? styles.landscapeContent : styles.content}>
        {isLandscape ? (
          // Landscape layout
          <View style={styles.landscapeContainer}>
            <View style={styles.landscapeLeftColumn}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/icon.png')}
                  style={[styles.logo, isLandscape && styles.landscapeLogo]}
                  resizeMode="contain"
                />
                <Text style={[styles.title, isLandscape && styles.landscapeTitle]}>Deltion Weather App</Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>About this App</Text>
                <Text style={styles.paragraph}>
                  This Weather App was created for a school project at Deltion College. It provides 
                  current weather information, forecasts, and allows you to save your favorite locations.
                </Text>
              </View>

              <View style={styles.creditCard}>
                <Text style={styles.creditText}>
                  Weather data provided by OpenWeatherMap
                </Text>
              </View>
            </View>

            <View style={styles.landscapeRightColumn}>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Features</Text>
                <View style={styles.featureItem}>
                  <Ionicons name="location" size={24} color="#4cc9f0" />
                  <Text style={styles.featureText}>Real-time weather based on your location</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="thermometer" size={24} color="#4cc9f0" />
                  <Text style={styles.featureText}>Temperature in Celsius or Fahrenheit</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="navigate" size={24} color="#4cc9f0" />
                  <Text style={styles.featureText}>Wind direction and speed</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="speedometer" size={24} color="#4cc9f0" />
                  <Text style={styles.featureText}>Atmospheric pressure</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="phone-landscape" size={24} color="#4cc9f0" />
                  <Text style={styles.featureText}>Responsive layout for portrait and landscape</Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Developers</Text>
                <View style={styles.developerInfo}>
                  <Ionicons name="person-circle" size={50} color="#4cc9f0" />
                  <View style={styles.developerText}>
                    <Text style={styles.developerName}>Wesley</Text>
                    <Text style={styles.developerRole}>Student Developer</Text>
                    <Text style={styles.developerSchool}>Class SD3A - Deltion College</Text>
                  </View>
                </View>
                
                <View style={styles.developerInfo}>
                  <Ionicons name="person-circle" size={50} color="#4cc9f0" />
                  <View style={styles.developerText}>
                    <Text style={styles.developerName}>Teun</Text>
                    <Text style={styles.developerRole}>Student Developer</Text>
                    <Text style={styles.developerSchool}>Class SD3A - Deltion College</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.copyright}>
                © {currentYear} Wesley & Teun - Class SD3A - Deltion College. All rights reserved.
              </Text>
            </View>
          </View>
        ) : (
          // Portrait layout (original)
          <>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>Deltion Weather App</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>About this App</Text>
              <Text style={styles.paragraph}>
                This Weather App was created for a school project at Deltion College. It provides 
                current weather information, forecasts, and allows you to save your favorite locations.
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Features</Text>
              <View style={styles.featureItem}>
                <Ionicons name="location" size={24} color="#4cc9f0" />
                <Text style={styles.featureText}>Real-time weather based on your location</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="thermometer" size={24} color="#4cc9f0" />
                <Text style={styles.featureText}>Temperature in Celsius or Fahrenheit</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="navigate" size={24} color="#4cc9f0" />
                <Text style={styles.featureText}>Wind direction and speed</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="speedometer" size={24} color="#4cc9f0" />
                <Text style={styles.featureText}>Atmospheric pressure</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="phone-landscape" size={24} color="#4cc9f0" />
                <Text style={styles.featureText}>Responsive layout for portrait and landscape</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Developers</Text>
              <View style={styles.developerInfo}>
                <Ionicons name="person-circle" size={50} color="#4cc9f0" />
                <View style={styles.developerText}>
                  <Text style={styles.developerName}>Wesley</Text>
                  <Text style={styles.developerRole}>Student Developer</Text>
                  <Text style={styles.developerSchool}>Class SD3A - Deltion College</Text>
                </View>
              </View>
              
              <View style={styles.developerInfo}>
                <Ionicons name="person-circle" size={50} color="#4cc9f0" />
                <View style={styles.developerText}>
                  <Text style={styles.developerName}>Teun</Text>
                  <Text style={styles.developerRole}>Student Developer</Text>
                  <Text style={styles.developerSchool}>Class SD3A - Deltion College</Text>
                </View>
              </View>
            </View>

            <View style={styles.creditCard}>
              <Text style={styles.creditText}>
                Weather data provided by OpenWeatherMap
              </Text>
            </View>

            <Text style={styles.copyright}>
              © {currentYear} Wesley & Teun - Class SD3A - Deltion College. All rights reserved.
            </Text>
          </>
        )}
      </View>
    </ScrollView>
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
    paddingBottom: 30,
  },
  landscapeContent: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  landscapeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  landscapeLeftColumn: {
    flex: 1,
    paddingRight: 10,
  },
  landscapeRightColumn: {
    flex: 1,
    paddingLeft: 10,
  },
  landscapeLogo: {
    width: 80,
    height: 80,
  },
  landscapeTitle: {
    fontSize: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    color: 'white',
    marginBottom: 10,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  developerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  developerText: {
    marginLeft: 15,
  },
  developerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  developerRole: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  developerSchool: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
  },
  creditCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  creditText: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    marginBottom: 5,
  },
  link: {
    fontSize: 14,
    color: '#4cc9f0',
    textDecorationLine: 'underline',
  },
  copyright: {
    fontSize: 14,
    color: 'white',
    opacity: 0.6,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default AboutScreen;
