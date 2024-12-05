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
import ConCheck from "@/app/validations/conCheck";
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
        <Text style={styles.statLabel}>Total Consumption</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>
          {profileData?.reputation || 0}
        </Text>
        <Text style={styles.statLabel}>Total Payment</Text>
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
    <ConCheck>
      <View style={styles.fullBackground}>
        {/* Background Image */}
        <ImageBackground
          source={{ uri: "https://via.placeholder.com/800x1600" }} // Replace with your desired image URL
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        >
          {/* Background Gradient Overlay */}
          <LinearGradient
            colors={["rgba(0, 123, 255, 0.8)", "rgba(108, 117, 125, 0.8)"]}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Main Content */}
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#007bff", "#28a745"]}
              />
            }
            style={styles.container}
          >
            <View style={styles.headerContainer}>
              <TouchableOpacity
                onPress={() => navigation.navigate("Settings/index")}
                style={styles.headerButton}
              >
                <Ionicons name="settings-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
                <MaterialIcons name="logout" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileSection}>
              <TouchableOpacity
                onPress={() => navigation.navigate("EditProfile/index")}
                style={styles.profileImageContainer}
              >
                <Image
                  source={{
                    uri: profileData?.profileImage || "https://via.placeholder.com/150",
                  }}
                  style={styles.profileImage}
                />
                <View style={styles.editOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                </View>
              </TouchableOpacity>

              <Text style={styles.username}>{profileData?.username || "User"}</Text>
              <Text style={styles.email}>{profileData?.email || "email@example.com"}</Text>

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
          </ScrollView>
        </ImageBackground>
      </View>
    </ConCheck>
  );
}

const styles = StyleSheet.create({
  fullBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent', // Ensure transparency for the background to show through
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  headerButton: {
    marginTop:15,
    marginLeft: 15,
    marginRight:10,
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
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
});
