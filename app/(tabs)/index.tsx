import ErrorBoundary from '@/components/ErrorBoundary';
import WeatherScreen from '@/components/screens/WeatherScreen';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function WeatherTab() {
  return (
    <View style={styles.container}>
      <ErrorBoundary>
        <WeatherScreen />
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
