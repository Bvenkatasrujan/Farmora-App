import React from 'react';
import { View, Text } from 'react-native';
import { calendarStyles } from '../styles/calendarStyles';

export const EmptyTasks: React.FC = () => {
  return (
    <View style={calendarStyles.emptyCard}>
      <Text style={calendarStyles.emptyEmoji}>🚜</Text>
      <Text style={calendarStyles.emptyText}>
        No farming activities scheduled for this day.
      </Text>
    </View>
  );
};
