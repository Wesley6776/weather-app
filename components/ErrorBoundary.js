import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.log('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render error UI
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error && this.state.error.toString()}
          </Text>
          <Text style={styles.errorDetail}>
            Component Stack:{'\n'}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </Text>
        </View>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: '#ff6b6b',
    marginBottom: 15,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginHorizontal: 20,
  },
});

export default ErrorBoundary;
