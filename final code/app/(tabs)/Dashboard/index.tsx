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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import AuthCheck from '@/app/validations/AuthCheck';
import apiClient from '@/app/api-component/apiClient'; // Ensure this path is correct

// Get the screen width for the chart
const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [powerData, setPowerData] = useState({
    labels: ['6am', '9am', '12pm', '3pm', '6pm', '9pm'],
    datasets: [
      {
        data: [20, 45, 78, 80, 43, 10], // Sample data
      },
    ],
  });
  const [predictionData, setPredictionData] = useState(null);
  const [predictionError, setPredictionError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('lahore'); // Fixed to lahore

  const navigation = useNavigation();

  // Fetch prediction data from backend
  const fetchPredictions = async (city) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/prediction/predict/', { city: city }); // Uses interceptor for token
      setPredictionData(response.data);
      setPredictionError(null);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      // The interceptor handles 401 and refreshes the token if needed
      setPredictionError(
        error.response?.data?.message || 'Failed to load prediction data.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount with fixed city
  useEffect(() => {
    fetchPredictions(selectedCity);
  }, [selectedCity]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setPowerData({
        ...powerData,
        datasets: [
          {
            data: powerData.datasets[0].data.map(
              (val) => val + Math.random() * 10 - 5
            ),
          },
        ],
      });
      setRefreshing(false);
    }, 1000);
  }, [powerData]);

  return (
    <AuthCheck>
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
              <Text style={styles.powerValue}>4.5 kW</Text>
              <Text style={styles.powerTrend}>↑ 12% from yesterday</Text>
            </View>
          </View>

          {/* Today's Generation Chart */}
          <View style={styles.chartContainer}>
            <Text style={styles.cardTitle}>Today's Generation</Text>
            <LineChart
              data={powerData}
              width={screenWidth - 40}
              height={250}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(46, 125, 50, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          {/* City Display (Fixed to Lahore) */}
          {/* <View style={styles.cityDisplay}>
            <Text style={styles.cityText}>City: Lahore</Text>
          </View> */}

          {/* 5-Day Power Prediction Section */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>5-Day Power Prediction</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading predictions...</Text>
            ) : predictionError ? (
              <Text style={styles.errorText}>{predictionError}</Text>
            ) : !predictionData ? (
              <Text style={styles.errorText}>No data available.</Text>
            ) : (
              <View style={styles.predictionInfo}>
                <Text style={styles.predictionCity}>
                  City: {predictionData.city}
                </Text>
                <Text style={styles.predictionUnit}>
                  Unit: {predictionData.unit}
                </Text>
                <Text style={styles.predictionHorizon}>
                  Horizon: {predictionData.horizon}
                </Text>
                {predictionData.note && (
                  <Text style={styles.predictionNote}>
                    Note: {predictionData.note}
                  </Text>
                )}
                {predictionData.predictions.map((value, index) => (
                  <View key={index} style={styles.predictionItem}>
                    <Text style={styles.predictionTimestep}>
                      {predictionData.timesteps[index]}:
                    </Text>
                    <Text style={styles.predictionValue}>
                      {value.toFixed(2)} {predictionData.unit}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </AuthCheck>
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
  cityDisplay: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cityText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  predictionInfo: {
    marginTop: 8,
  },
  predictionCity: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  predictionUnit: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  predictionHorizon: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  predictionNote: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  predictionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  predictionTimestep: {
    fontSize: 14,
    color: '#444',
  },
  predictionValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default Dashboard;