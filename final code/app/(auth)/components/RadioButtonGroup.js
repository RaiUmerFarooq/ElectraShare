import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const RadioButtonGroup = ({ options, selectedOption, onSelect }) => {
  return (
    <View style={styles.radioContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={styles.radioOption}
          onPress={() => onSelect(option)}
        >
          <Text style={styles.radioText}>{option}</Text>
          <View style={[styles.radioCircle, selectedOption === option && styles.radioCircleSelected]} />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  radioContainer: { flexDirection: 'row', justifyContent: 'center', marginVertical: 10 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 5 },
  radioText: { marginRight: 5, fontSize: 16 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: 'transparent',
  },
  radioCircleSelected: { backgroundColor: '#4CAF50' },
});

export default RadioButtonGroup;
