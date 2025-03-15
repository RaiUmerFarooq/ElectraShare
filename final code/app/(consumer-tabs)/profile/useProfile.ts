import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "expo-router";
import { Alert } from "react-native";

export const useProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) {
        Alert.alert("Session Expired", "Please log in again.", [
          { text: "OK", onPress: () => navigation.navigate("(auth)/Signin/index") },
        ]);
        return;
      }

      const response = await axios.get("http://localhost:8000/api/users/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileData(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert("Fetch Failed", "Unable to retrieve profile. Check your connection and try again.", [
        { text: "Retry", onPress: () => fetchProfile() },
        { text: "Logout", onPress: () => handleLogout() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProfile().then(() => setRefreshing(false));
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await AsyncStorage.multiRemove(["accessToken", "refreshToken", "sessionExpiry"]);
      setTimeout(() => {
        setIsLoggingOut(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "(auth)/Signin/index" }],
        });
      }, 2000);
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Logout Error", "Failed to logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return { profileData, loading, isLoggingOut, refreshing, onRefresh, handleLogout, navigation };
};