import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { View, ActivityIndicator, Alert } from 'react-native';

const conCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
          const response = await axios.get("http://localhost:8000/api/users/profile/", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (response.status === 200 && response.data.status === 'consumer') {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            Alert.alert('Access Denied', 'You are not authorized to access this section.');
            navigation.navigate('(auth)/Signin/index');
          }
        } else {
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('sessionExpiry');
          await AsyncStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          Alert.alert('Session Expired', 'Please log in again.');
          navigation.navigate('(auth)/Signin/index');
        }
      } else {
        setIsAuthenticated(false);
        navigation.navigate('(auth)/Signin/index');
      }
    } catch (error) {
      console.error('Error checking auth token:', error);
      setIsAuthenticated(false);
      navigation.navigate('(auth)/Signin/index');
    }
  };

  useEffect(() => {
    checkAuthToken();
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

export default conCheck;
