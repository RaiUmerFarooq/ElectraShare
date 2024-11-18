import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "expo-router";
import { Link } from "expo-router";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Retrieve the token from AsyncStorage
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          Alert.alert("Error", "You are not logged in.");
          return;
        }

        // Fetch the profile data from the backend
        const response = await axios.get("http://localhost:8000/api/users/profile/", {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          },
        });

        // Store profile data in state
        setProfileData(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        Alert.alert("Error", "Failed to fetch profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      // Remove the token from AsyncStorage
      await AsyncStorage.removeItem("accessToken");
      // Navigate to the Login screen
      navigation.navigate("login"); // Adjust the path according to your routing structure
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout.");
    }
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile Screen</Text>
      {profileData ? (
        <View>
          <Text>Username: {profileData.username || "Not available"}</Text>
          <Text>Email: {profileData.email || "Not available"}</Text>
        </View>
      ) : (
        <Text>No profile data available.</Text>
      )}

      <Link href={"/logout"}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          accessibilityLabel="Navigate to Logout"
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#d9534f",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
