import AboutScreen from '@/components/screens/AboutScreen';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function AboutTab() {
  return (
    <View style={styles.container}>
      <AboutScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
