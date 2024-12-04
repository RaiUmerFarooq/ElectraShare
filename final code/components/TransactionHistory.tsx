import React from 'react';  
import {  
  View,  
  StyleSheet,  
  ScrollView,  
  ImageBackground  
} from 'react-native';  
import {  
  Text,  
  Card,  
  Title,  
  Button  
} from 'react-native-paper';  
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';  
  
type Transaction = {  
  id: string;  
  title: string;  
  amount: number;  
  date: string;  
  paymentMethod: string;  
  status: string;  
};  
  
type Props = {  
  transaction: Transaction;  
  onBack: () => void; // Add onBack prop  
};  
  
const TransactionHistoryScreen: React.FC<Props> = ({ transaction, onBack }) => {  
  return (  
   <ImageBackground  
    source={{ uri: 'https://cdn.ecommercedns.uk/files/5/235315/5/12792415/solar-power.jpg' }}  
    style={styles.background}  
    blurRadius={5}  
   >  
    <ScrollView contentContainerStyle={styles.container}>  
      <Title style={styles.screenTitle}>Transaction Confirmation</Title>  
       
      <Card style={styles.transactionCard}>  
       <Card.Content>  
        <View style={styles.successIconContainer}>  
          <Icon name="check-circle" size={80} color="#4CAF50" />  
        </View>  
          
        <Title style={styles.successTitle}>Payment Successful!</Title>  
          
        <View style={styles.transactionDetails}>  
          <View style={styles.detailRow}>  
           <Text style={styles.detailLabel}>Transaction ID:</Text>  
           <Text style={styles.detailValue}>{transaction.id}</Text>  
          </View>  
           
          <View style={styles.detailRow}>  
           <Text style={styles.detailLabel}>Post:</Text>  
           <Text style={styles.detailValue}>{transaction.title}</Text>  
          </View>  
           
          <View style={styles.detailRow}>  
           <Text style={styles.detailLabel}>Amount:</Text>  
           <Text style={styles.detailValue}>${transaction.amount}</Text>  
          </View>  
           
          <View style={styles.detailRow}>  
           <Text style={styles.detailLabel}>Date:</Text>  
           <Text style={styles.detailValue}>{transaction.date}</Text>  
          </View>  
           
          <View style={styles.detailRow}>  
           <Text style={styles.detailLabel}>Payment Method:</Text>  
           <Text style={styles.detailValue}>{transaction.paymentMethod}</Text>  
          </View>  
           
          <View style={styles.detailRow}>  
           <Text style={styles.detailLabel}>Status:</Text>  
           <Text style={[styles.detailValue, {  
            color: transaction.status === 'Completed' ? '#4CAF50' : '#F44336'  
           }]}>  
            {transaction.status}  
           </Text>  
          </View>  
        </View>  
       </Card.Content>  
      </Card>  
  
      {/* Button to navigate back to the previous screen */}  
      <Button  
       mode="contained"  
       onPress={onBack}   
       style={styles.continueButton}  
      >  
       Continue Browsing  
      </Button>  
    </ScrollView>  
   </ImageBackground>  
  );  
};  
  
const styles = StyleSheet.create({  
  background: {  
   flex: 1,  
   backgroundColor: 'rgba(0,0,0,0.1)',  
  },  
  container: {  
   padding: 15,  
   paddingBottom: 50,  
  },  
  screenTitle: {  
   fontSize: 24,  
   fontWeight: 'bold',  
   textAlign: 'center',  
   marginBottom: 20,  
  },  
  transactionCard: {  
   borderRadius: 10,  
   marginBottom: 20,  
  },  
  successIconContainer: {  
   alignItems: 'center',  
   marginBottom: 15,  
  },  
  successTitle: {  
   textAlign: 'center',  
   color: '#4CAF50',  
   marginBottom: 20,  
  },  
  transactionDetails: {  
   marginTop: 10,  
  },  
  detailRow: {  
   flexDirection: 'row',  
   justifyContent: 'space-between',  
   marginVertical: 8,  
   paddingHorizontal: 10,  
  },  
  detailLabel: {  
   fontSize: 16,  
   color: '#666',  
  },  
  detailValue: {  
   fontSize: 16,  
   fontWeight: 'bold',  
  },  
  continueButton: {  
   padding: 10,  
   backgroundColor: '#4CAF50',  
  },  
});  
  
export default TransactionHistoryScreen;
