import SettingsScreen from '@/components/screens/SettingsScreen';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function SettingsTab() {
  return (
    <View style={styles.container}>
      <SettingsScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
