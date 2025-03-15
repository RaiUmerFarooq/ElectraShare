// ProfileStats.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const ProfileStats = ({ profileData }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statBox}>
      <Text style={styles.statNumber}>{profileData?.totalProjects || 0}</Text>
      <Text style={styles.statLabel}>Total Consumption</Text>
    </View>
    <View style={styles.statBox}>
      <Text style={styles.statNumber}>{profileData?.reputation || 0}</Text>
      <Text style={styles.statLabel}>Total Payment</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  statsContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  statBox: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", padding: 15, borderRadius: 10, width: "45%" },
  statNumber: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  statLabel: { fontSize: 14, color: "#e0e0e0", marginTop: 5 },
});