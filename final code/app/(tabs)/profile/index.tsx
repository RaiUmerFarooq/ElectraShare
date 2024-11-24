import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, ImageBackground } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "expo-router";
import { Ionicons } from "react-native-vector-icons";
import AuthCheck from "@/app/validations/AuthCheck";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        if (!token) {
          Alert.alert("Error", "You are not logged in.");
          return;
        }

        const response = await axios.get("http://localhost:8000/api/users/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });

       // console.log("Profile Data:", response.data); // Log profile data to the console
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
    setIsLoggingOut(true);
    try {
      await AsyncStorage.removeItem("accessToken");
      await AsyncStorage.removeItem("refreshToken");
      await AsyncStorage.removeItem("sessionExpiry");

      setTimeout(() => {
        setIsLoggingOut(false);
        navigation.navigate("(auth)/Signin/index");
      }, 4000);
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout.");
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Fetching your profile...</Text>
      </View>
    );
  }

  if (isLoggingOut) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Logging out...</Text>
      </View>
    );
  }

  return (
    <AuthCheck>
    <ImageBackground
      source={{ uri: "https://th.bing.com/th/id/OIP.srerCJPIm2TKd1ZKp-N6EwAAAA?w=400&h=600&rs=1&pid=ImgDetMain" }} // Replace with your background image URL
      style={styles.container}
      imageStyle={{ opacity: 0.3 }}
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("EditProfile/index")} style={styles.editProfileButton}>
          <Ionicons name="pencil-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileImageContainer}>
        <Image
          source={{ uri: profileData?.profileImage || "https://via.placeholder.com/100" }}
          style={styles.profileImage}
        />
      </View>

      {profileData ? (
        <View style={styles.profileInfo}>
          <Text style={styles.username}>{profileData.username || "Not available"}</Text>
          <Text style={styles.email}>{profileData.email || "Not available"}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusTitle}>Status:</Text>
            <Text style={profileData.status === "producer" ? styles.providerText : styles.consumerText}>
              {profileData.status === "producer" ? "producer" : "Consumer"}
            </Text>
          </View>
        </View>
      ) : (
        <Text style={styles.noDataText}>No profile data available.</Text>
      )}
    </ImageBackground>
    </AuthCheck>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  headerContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "#d9534f",
    borderRadius: 50,
    marginLeft: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  editProfileButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#dcdcdc",
  },
  profileInfo: {
    marginBottom: 30,
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  statusContainer: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#e9ecef",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: "100%",
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 18,
    color: "#333",
    fontWeight: "600",
    marginBottom: 8,
  },
  providerText: {
    fontSize: 18,
    color: "#28a745",
    fontWeight: "bold",
  },
  consumerText: {
    fontSize: 18,
    color: "#dc3545",
    fontWeight: "bold",
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: "#333",
  },
  noDataText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    marginTop: 20,
  },
});
