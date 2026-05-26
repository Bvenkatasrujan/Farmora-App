import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Plus } from 'lucide-react-native';
import { calendarStyles } from '../styles/calendarStyles';

interface AddTaskButtonProps {
  onPress: () => void;
}

export const AddTaskButton: React.FC<AddTaskButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={calendarStyles.fab}
      accessibilityLabel="Add farming activity"
      accessibilityRole="button"
    >
      <Plus size={20} color="#FFFFFF" strokeWidth={3.5} />
      <Text style={calendarStyles.fabText}>Add Task</Text>
    </TouchableOpacity>
  );
};
