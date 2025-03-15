import React from "react";
import { View, StyleSheet, ActivityIndicator, Text, ScrollView, RefreshControl, ImageBackground, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AuthCheck from "@/app/validations/AuthCheck";
import ConCheck from "@/app/validations/conCheck";
import { useProfile } from "./useProfile";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileSection } from "./ProfileSection";
import { ProfileStats } from "./ProfileStats";

export default function Profile() {
  const { profileData, loading, isLoggingOut, refreshing, onRefresh, handleLogout, navigation } = useProfile();

  if (loading || isLoggingOut) {
    return (
      <LinearGradient colors={["#4c669f", "#3b5998", "#192f6a"]} style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>{loading ? "Fetching your profile..." : "Logging out..."}</Text>
      </LinearGradient>
    );
  }

  return (
    <ConCheck>
      <View style={styles.fullBackground}>
        <ImageBackground
          source={{ uri: "https://via.placeholder.com/800x1600" }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        >
          <LinearGradient colors={["rgba(0, 123, 255, 0.8)", "rgba(108, 117, 125, 0.8)"]} style={StyleSheet.absoluteFillObject} />
          <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#007bff", "#28a745"]} />}
            style={styles.container}
          >
            <ProfileHeader
              onSettingsPress={() => navigation.navigate("Settings/index")}
              onLogoutPress={handleLogout}
            />
            <ProfileSection
              profileData={profileData}
              onEditPress={() => navigation.navigate("EditProfile/index")}
            />
            <ProfileStats profileData={profileData} />
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
  fullBackground: { flex: 1 },
  container: { flex: 1, backgroundColor: "transparent" },
  actionButton: { backgroundColor: "rgba(255,255,255,0.2)", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#3b5998" },
  loadingText: { marginTop: 10, color: "#fff", fontSize: 16 },
});