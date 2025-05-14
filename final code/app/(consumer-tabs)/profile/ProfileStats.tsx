import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import apiClient from '@/app/api-component/apiClient'; // Import apiClient for API calls

export const ProfileStats = ({ profileData }) => {
  const [totalGeneration, setTotalGeneration] = useState<number>(0); // Store total generation in watts

  // Fetch total generation from the API
  const fetchTotalGeneration = async () => {
    try {
      const response = await apiClient.get('/solar/get-total-production/');
      const totalProd = response.data.total_production || 0; // Assuming API returns { "total_production": 123.45 }
      setTotalGeneration(totalProd); // Total generation in watts
    } catch (error) {
      console.error('Error fetching total generation:', error);
      setTotalGeneration(0); // Fallback to 0 on error
    }
  };

  // Fetch data on mount and every 5 seconds
  useEffect(() => {
    fetchTotalGeneration(); // Initial fetch

    const intervalId = setInterval(() => {
      fetchTotalGeneration();
    }, 5000); // Fetch every 5 seconds

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Calculate combined total (Consumption + Generation) in kWh
  const totalConsumption = (profileData?.totalProjects || 0) + totalGeneration; // Both in watts
  const totalConsumptionKWh = totalConsumption / 1000; // Convert to kWh

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{totalConsumptionKWh.toFixed(2)}</Text>
        <Text style={styles.statLabel}>Total Consumption (kWh)</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statNumber}>{profileData?.reputation || 0}</Text>
        <Text style={styles.statLabel}>Total Payment</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statsContainer: { flexDirection: "row", justifyContent: "space-around", marginVertical: 20 },
  statBox: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.1)", padding: 15, borderRadius: 10, width: "45%" },
  statNumber: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  statLabel: { fontSize: 14, color: "#e0e0e0", marginTop: 5 },
});