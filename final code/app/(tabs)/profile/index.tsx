import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ActivityIndicator, 
  ImageBackground,
  ScrollView,
  RefreshControl
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "expo-router";
import { Ionicons, MaterialIcons } from "react-native-vector-icons";
import AuthCheck from "@/app/validations/AuthCheck";
import conCheck from "@/app/validations/conCheck";
import { LinearGradient } from "expo-linear-gradient";

export default function Profile() {
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
          { text: "OK", onPress: () => navigation.navigate("(auth)/Signin/index") }
        ]);
        return;
      }

      const response = await axios.get("http://localhost:8000/api/users/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert(
        "Fetch Failed", 
        "Unable to retrieve profile. Check your connection and try again.", 
        [
          { 
            text: "Retry", 
            onPress: () => fetchProfile() 
          },
          { 
            text: "Logout", 
            onPress: () => handleLogout() 
          }
        ]
      );
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = React.useCallback(() => {
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

  const renderProfileStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>
          {profileData?.totalProjects || 0}
        </Text>
        <Text style={styles.statLabel}>Total Projects</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>
          {profileData?.reputation || 0}
        </Text>
        <Text style={styles.statLabel}>Reputation</Text>
      </View>
    </View>
  );

  if (loading || isLoggingOut) {
    return (
      <LinearGradient 
        colors={['#4c669f', '#3b5998', '#192f6a']} 
        style={styles.loadingScreen}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>
          {loading ? "Fetching your profile..." : "Logging out..."}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <conCheck>
      <ScrollView 
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007bff', '#28a745']}
          />
        }
        style={styles.container}
      >
        <LinearGradient
          colors={['#007bff', '#6c757d']}
          style={styles.gradientBackground}
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              onPress={() => navigation.navigate("Settings/index")} 
              style={styles.headerButton}
            >
              <Ionicons name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleLogout} 
              style={styles.headerButton}
            >
              <MaterialIcons name="logout" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <TouchableOpacity 
              onPress={() => navigation.navigate("EditProfile/index")}
              style={styles.profileImageContainer}
            >
              <Image
                source={{ uri: profileData?.profileImage || "https://via.placeholder.com/150" }}
                style={styles.profileImage}
              />
              <View style={styles.editOverlay}>
                <Ionicons name="camera" size={24} color="#fff" />
              </View>
            </TouchableOpacity>

            <Text style={styles.username}>
              {profileData?.username || "User"}
            </Text>
            <Text style={styles.email}>
              {profileData?.email || "email@example.com"}
            </Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {profileData?.status === "producer" ? "Producer" : "Consumer"}
              </Text>
            </View>
          </View>

          {renderProfileStats()}

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate("EditProfile/index")}
          >
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </conCheck>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  gradientBackground: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  headerButton: {
    marginLeft: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    padding: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#fff',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 8,
  },
  username: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 15,
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 10,
    width: '45%',
  },
  statNumber: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    color: '#e0e0e0',
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b5998',
  },
  loadingText: {
    marginTop: 15,
    color: '#fff',
    fontSize: 18,
  },
});