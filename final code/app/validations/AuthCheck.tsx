import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, ActivityIndicator, Alert, Platform } from 'react-native';

const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuthToken = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const expiry = await AsyncStorage.getItem('sessionExpiry');

      if (accessToken && expiry) {
        const currentTime = new Date().getTime();
        const expiryTime = new Date(expiry).getTime();

        if (expiryTime > currentTime) {
          const response = await axios.get('http://localhost:8000/api/users/profile/', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (response.status === 200 && response.data.status === 'producer') {
            setIsAuthenticated(true);
          } else {
            handleUnauthorized('You are not authorized to access this section.');
          }
        } else {
          handleSessionExpired();
        }
      } else {
        handleUnauthorized('You must log in to continue.');
      }
    } catch (error) {
      console.error('Error checking auth token:', error);
      handleUnauthorized('An error occurred. Please log in again.');
    }
  };

  const handleSessionExpired = async () => {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('sessionExpiry');
    await AsyncStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    Alert.alert('Session Expired', 'Please log in again.');
    navigation.navigate('(auth)/Signin/index');
  };

  const handleUnauthorized = (message: string) => {
    setIsAuthenticated(false);
    Alert.alert('Access Denied', message);
    navigation.navigate('(auth)/Signin/index');
  };

  useEffect(() => {
    if (Platform.OS !== 'web') {
      checkAuthToken(); // Only run for non-web environments
    } else {
      setIsAuthenticated(true); // Assume authenticated for web testing
    }
  }, [navigation]);

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return isAuthenticated ? <>{children}</> : null;
};

export default AuthCheck;