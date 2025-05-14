import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import ConCheck from '../validations/conCheck';
import apiClient from '@/app/api-component/apiClient';

// Get the screen width for the chart
const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [currentPower, setCurrentPower] = useState<number | null>(null);
  const [powerTrend, setPowerTrend] = useState<string>('N/A');
  const [powerData, setPowerData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
      },
    ],
  });

  const navigation = useNavigation();

  // Fetch power data from the API
  const fetchPowerData = async () => {
    try {
      const response = await apiClient.get('/solar/fetch-power/');
      const data = response.data; // { "timestamp": "...", "power_watts": ..., "weather": "..." }
      const power = data.power_watts;
      const timestamp = new Date(data.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Update current power
      setCurrentPower(power / 1000); // Convert watts to kW

      // Calculate trend
      setPowerTrend((prevTrend) => {
        if (prevTrend === 'N/A') return 'N/A';
        const previousPower = powerData.datasets[0].data[powerData.datasets[0].data.length - 1] || 0;
        const trendValue = previousPower !== 0 ? ((power - previousPower) / previousPower) * 100 : 0;
        return trendValue >= 0
          ? `↑ ${trendValue.toFixed(1)}% from previous`
          : `↓ ${Math.abs(trendValue).toFixed(1)}% from previous`;
      });

      // Update powerData with new reading (keep last 6 points)
      setPowerData((prevData) => {
        const newLabels = [...prevData.labels, timestamp].slice(-6);
        const newDataPoints = [...prevData.datasets[0].data, power].slice(-6);
        return {
          labels: newLabels,
          datasets: [
            {
              data: newDataPoints,
            },
          ],
        };
      });
    } catch (error) {
      console.error('Error fetching power data:', error);
      // Fallback to zeros on error
      setPowerData({
        labels: [],
        datasets: [
          {
            data: [],
          },
        ],
      });
      setCurrentPower(4.5);
      setPowerTrend('N/A');
    }
  };

  // Fetch data on mount and every 5 seconds
  useEffect(() => {
    // Initial fetch
    fetchPowerData();

    // Set up interval to fetch data every 5 seconds
    const intervalId = setInterval(() => {
      fetchPowerData();
    }, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPowerData().then(() => setRefreshing(false));
  }, []);

  return (
    <ConCheck>
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={{
            uri: 'https://thumbs.dreamstime.com/b/cartoon-planet-cute-d-icon-earth-day-environment-conservation-concept-low-poly-save-green-isolated-transparent-background-png-274956627.jpg',
          }}
          style={styles.backgroundImage}
        />

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Solar Monitoring Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Current Power Generation</Text>
            <View style={styles.powerInfo}>
              <Text style={styles.powerValue}>
                {currentPower !== null ? `${currentPower.toFixed(1)} kW` : 'Loading...'}
              </Text>
              <Text style={styles.powerTrend}>{powerTrend}</Text>
            </View>
          </View>

          {/* Recent Generation Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.cardTitle}>Recent Power Generation</Text>
            {powerData.labels.length > 0 ? (
              <LineChart
                data={powerData}
                width={screenWidth - 40}
                height={250}
                chartConfig={{
                  backgroundColor: '#f5f6fa', // Light gray background
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#e0e7ff', // Soft blue gradient
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`, // Forest green line
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Black labels for readability
                  style: {
                    borderRadius: 16,
                    padding: 10,
                  },
                  propsForDots: {
                    r: '6', // Larger dots for emphasis
                    strokeWidth: '2',
                    stroke: '#2E7D32', // Green outline for dots
                  },
                  propsForBackgroundLines: {
                    stroke: '#e0e0e0', // Lighter grid lines
                    strokeDasharray: [5, 5], // Dashed grid lines
                  },
                  fillShadowGradient: '#c8e6c9', // Light green fill under the line
                  fillShadowGradientOpacity: 0.7,
                }}
                bezier
                withVerticalLines={true} // Add vertical grid lines
                withHorizontalLines={true} // Add horizontal grid lines
                withInnerLines={true} // Enable inner grid
                withOuterLines={false} // Disable outer border lines
                withDots={true} // Show data points
                style={styles.chart}
              />
            ) : (
              <Text style={styles.loadingText}>Loading power data...</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </ConCheck>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    zIndex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  powerInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  powerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  powerTrend: {
    marginLeft: 10,
    color: '#4CAF50',
    fontSize: 16,
  },
  chart: {
    marginVertical: 16,
    borderRadius: 16,
    flexShrink: 1,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Dashboard;