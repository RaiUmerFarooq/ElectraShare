import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native'; // or 'expo-router' if using that for navigation
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, Alert } from 'react-native'; // Use loading indicator while checking auth

const AuthCheck: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigation = useNavigation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Track auth status

  const checkAuthToken = async () => {
    try {
      const accessToken = await AsyncStorage.getItem('accessToken');
      const expiry = await AsyncStorage.getItem('sessionExpiry'); // Retrieve expiry as ISO string

      if (accessToken && expiry) {
        const currentTime = new Date().getTime(); // Current time in milliseconds
        const expiryTime = new Date(expiry).getTime(); // Parse ISO string to Date and get milliseconds

        if (expiryTime > currentTime) {
          setIsAuthenticated(true); // Token is valid
        } else {
          // Token is expired, clear storage and navigate to SignIn
          await AsyncStorage.removeItem('accessToken');
          await AsyncStorage.removeItem('sessionExpiry');
          await AsyncStorage.removeItem('refreshToken'); // Clear refreshToken as well if needed
          setIsAuthenticated(false);
          Alert.alert('Session Expired', 'Please log in again.');
          navigation.navigate('(auth)/Signin/index');
        }
      } else {
        setIsAuthenticated(false); // Token or expiry not found
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

  // Show a loading spinner while checking the authentication status
  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Render the component passed as a child only if the user is authenticated
  return isAuthenticated ? <>{children}</> : null;
};

export default AuthCheck;
