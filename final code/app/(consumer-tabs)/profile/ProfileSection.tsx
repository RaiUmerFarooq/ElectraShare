// ProfileSection.tsx
import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "react-native-vector-icons";

export const ProfileSection = ({ profileData, onEditPress }) => (
  <View style={styles.profileSection}>
    <TouchableOpacity onPress={onEditPress} style={styles.profileImageContainer}>
      <Image
        source={{ uri: profileData?.profileImage || "https://via.placeholder.com/150" }}
        style={styles.profileImage}
      />
      <View style={styles.editOverlay}>
        <Ionicons name="camera" size={24} color="#fff" />
      </View>
    </TouchableOpacity>
    <Text style={styles.username}>{profileData?.username || "User"}</Text>
    <Text style={styles.email}>{profileData?.email || "email@example.com"}</Text>
    <View style={styles.statusBadge}>
      <Text style={styles.statusText}>{profileData?.status === "producer" ? "Producer" : "Consumer"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  profileSection: { alignItems: "center", marginBottom: 20 },
  profileImageContainer: { position: "relative", marginBottom: 15 },
  profileImage: { width: 150, height: 150, borderRadius: 75, borderWidth: 3, borderColor: "#fff" },
  editOverlay: { position: "absolute", bottom: 0, right: 0, backgroundColor: "rgba(0,0,0,0.5)", borderRadius: 30, padding: 8 },
  username: { fontSize: 24, color: "#fff", fontWeight: "bold", marginBottom: 5 },
  email: { fontSize: 16, color: "#e0e0e0", marginBottom: 15 },
  statusBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  statusText: { color: "#fff", fontWeight: "bold" },
});