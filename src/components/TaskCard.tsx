import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FarmingTask } from '../types/calendar';
import { TASK_TYPES } from '../constants/taskTypes';
import { calendarStyles } from '../styles/calendarStyles';
import { Check } from 'lucide-react-native';

interface TaskCardProps {
  task: FarmingTask;
  onToggle: () => void;
  weatherAdvisory?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, weatherAdvisory }) => {
  const config = TASK_TYPES[task.type] || {
    label: 'Other',
    emoji: '🚜',
    color: '#2E7D32',
    bgColor: '#E8F5E9',
  };
  const isCompleted = !!task.completed;

  return (
    <View style={calendarStyles.taskCardContainer}>
      {/* Time display column */}
      <View style={calendarStyles.timeCol}>
        <Text style={calendarStyles.timeText}>{task.time}</Text>
      </View>

      {/* Main card details wrapper */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onToggle}
        style={[
          calendarStyles.cardMain,
          isCompleted && calendarStyles.cardCompleted,
        ]}
      >
        <View style={calendarStyles.cardLeft}>
          {/* Accent-colored badge with task emoji */}
          <View style={[calendarStyles.badge, { backgroundColor: config.bgColor }]}>
            <Text style={calendarStyles.typeEmoji}>{config.emoji}</Text>
          </View>

          {/* Description Block */}
          <View style={calendarStyles.detailsBlock}>
            <View style={calendarStyles.taskHeaderRow}>
              <Text style={[calendarStyles.categoryLabel, { color: config.color }]}>
                {config.label}
              </Text>
            </View>
            <Text
              style={[
                calendarStyles.taskTitle,
                isCompleted ? calendarStyles.taskTitleCompleted : null,
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
            {task.notes ? (
              <Text style={calendarStyles.taskNotes}>{task.notes}</Text>
            ) : null}

            {weatherAdvisory && !isCompleted ? (
              <Text 
                style={{ 
                  fontFamily: 'Inter', 
                  fontSize: 11, 
                  fontWeight: '700', 
                  color: weatherAdvisory.includes('⚠️') || weatherAdvisory.includes('🌧️') || weatherAdvisory.includes('🔥') ? '#c2410c' : '#15803d',
                  backgroundColor: weatherAdvisory.includes('⚠️') || weatherAdvisory.includes('🌧️') || weatherAdvisory.includes('🔥') ? '#fffbeb' : '#f0fdf4',
                  borderColor: weatherAdvisory.includes('⚠️') || weatherAdvisory.includes('🌧️') || weatherAdvisory.includes('🔥') ? '#fef3c7' : '#dcfce7',
                  borderWidth: 1,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginTop: 6,
                  alignSelf: 'flex-start'
                }}
              >
                {weatherAdvisory}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Custom checkbox */}
        <View
          style={[
            calendarStyles.checkboxWrapper,
            isCompleted && calendarStyles.checkboxChecked,
          ]}
        >
          {isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3.5} />}
        </View>
      </TouchableOpacity>
    </View>
  );
};

