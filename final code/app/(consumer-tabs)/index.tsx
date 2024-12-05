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
  import { useNavigation } from '@react-navigation/native'; // Import navigation
 // import AuthCheck from '@/app/validations/AuthCheck';
import ConCheck from '../validations/conCheck';
  
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
  
    const navigation = useNavigation(); // Hook to access navigation
  
    // Check for accessToken on mount
   
  
    const onRefresh = useCallback(() => {
      setRefreshing(true);
      // Simulate data fetch
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
     <ConCheck>
      <View style={styles.container}>
        {/* Background Image */}
        <Image
          source={{
            uri: 'https://thumbs.dreamstime.com/b/cartoon-planet-cute-d-icon-earth-day-environment-conservation-concept-low-poly-save-green-isolated-transparent-background-png-274956627.jpg',
          }} // Replace with the image URL you want to use
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
        </ScrollView>
      </View>
      </ConCheck>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative', // Ensures the background image is properly layered behind content
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
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // Transparent background to allow the image to show through
      borderRadius: 10,
      zIndex: 1, // Ensures content stays above the background image
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
      overflow: 'hidden', // Ensures chart stays inside the container
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
      flexShrink: 1, // Prevents chart from overflowing
    },
  });
  
  export default Dashboard;
  