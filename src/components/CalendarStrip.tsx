import React, { useRef, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View } from 'react-native';
import { calendarStyles } from '../styles/calendarStyles';

interface CalendarStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

export const CalendarStrip: React.FC<CalendarStripProps> = ({
  selectedDate,
  onSelectDate,
}) => {
  // Generate 15 days around today (7 days before, today, 7 days after today)
  const dateList = React.useMemo(() => {
    const list = [];
    const today = new Date();
    // Normalize today to midnight local time
    const refDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    for (let i = -7; i <= 7; i++) {
      const d = new Date(refDate);
      d.setDate(refDate.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayName = dayNames[d.getDay()];
      const dayNumber = String(d.getDate());
      
      // Let's check if it is today
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      list.push({
        dateString,
        dayName,
        dayNumber,
        isToday: dateString === todayStr,
      });
    }
    return list;
  }, []);

  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll the selected date to the center of the viewport
  useEffect(() => {
    const selectedIndex = dateList.findIndex(d => d.dateString === selectedDate);
    if (selectedIndex !== -1 && scrollViewRef.current) {
      // Calculate scroll offset: item width is 60, gap is 8, so 68px width per block.
      const itemWidth = 68;
      const scrollOffset = Math.max(0, selectedIndex * itemWidth - 140);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: scrollOffset, y: 0, animated: true });
      }, 150);
    }
  }, [selectedDate, dateList]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={calendarStyles.stripScroll}
      contentContainerStyle={calendarStyles.stripContent}
    >
      {dateList.map((item) => {
        const isSelected = item.dateString === selectedDate;
        return (
          <TouchableOpacity
            key={item.dateString}
            activeOpacity={0.85}
            onPress={() => onSelectDate(item.dateString)}
            style={[
              calendarStyles.dateCard,
              item.isToday && calendarStyles.dateCardToday,
              isSelected && calendarStyles.dateCardSelected,
            ]}
          >
            <Text
              style={[
                calendarStyles.dayName,
                isSelected ? calendarStyles.dayNameSelected : null,
              ]}
            >
              {item.dayName}
            </Text>
            <Text
              style={[
                calendarStyles.dayNumber,
                isSelected ? calendarStyles.dayNumberSelected : null,
              ]}
            >
              {item.dayNumber}
            </Text>
            {item.isToday && (
              <View
                style={[
                  calendarStyles.todayIndicator,
                  isSelected ? calendarStyles.todayIndicatorSelected : null,
                ]}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
