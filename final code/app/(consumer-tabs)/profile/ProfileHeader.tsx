// ProfileHeader.tsx
import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialIcons } from "react-native-vector-icons";

export const ProfileHeader = ({ onSettingsPress, onLogoutPress }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity onPress={onSettingsPress} style={styles.headerButton}>
      <Ionicons name="settings-outline" size={24} color="#fff" />
    </TouchableOpacity>
    <TouchableOpacity onPress={onLogoutPress} style={styles.headerButton}>
      <MaterialIcons name="logout" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  headerButton: {
    marginTop: 15,
    marginLeft: 15,
    marginRight: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 50,
    padding: 10,
  },
});