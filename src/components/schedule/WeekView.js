import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import ScheduleCard from '../ScheduleCard';
import TeacherScheduleCard from '../TeacherScheduleCard';

const WeekView = ({ 
  selectedDate, 
  scheduleData, 
  refreshing, 
  onRefresh, 
  onSetDateSelect,
  navigation,
  themeColor,
  userRole
}) => {
  const getWeekDates = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Thứ 2 là đầu tuần
    const monday = new Date(date.setDate(diff));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      weekDates.push({
        date: d.toISOString().split('T')[0],
        day: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'][i],
        dayNum: d.getDate(),
      });
    }
    return weekDates;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    return `${dayName}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const weekDates = getWeekDates(selectedDate);

  return (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Week Header */}
      <View className="px-4 py-3 bg-white">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity>
            <Text className="text-gray-900 font-semibold">2025</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text className="text-gray-900 font-semibold">Tuần 1</Text>
          </TouchableOpacity>
        </View>
        
        {/* Week Days */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDates.map((item) => (
            <TouchableOpacity
              key={item.date}
              onPress={() => onSetDateSelect(item.date)}
              style={[
                styles.weekDayButton,
                item.date === selectedDate && { backgroundColor: themeColor },
                scheduleData[item.date] && styles.weekDayButtonWithSchedule,
              ]}
            >
              <Text
                style={[
                  styles.weekDayText,
                  item.date === selectedDate && styles.weekDayTextSelected,
                ]}
              >
                {item.day}
              </Text>
              <Text
                style={[
                  styles.weekDayNum,
                  item.date === selectedDate && styles.weekDayNumSelected,
                ]}
              >
                {item.dayNum}
              </Text>
              {scheduleData[item.date] && (
                <View style={styles.weekDayDot} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Schedule List */}
      <View className="px-6 py-4">
        <View className=" rounded-lg px-3 py-1 self-start mb-4" style={{ backgroundColor: themeColor }}>
          <Text className="text-white font-semibold text-sm">
            {formatDateHeader(selectedDate)}
          </Text>
        </View>

        {scheduleData[selectedDate] && scheduleData[selectedDate].length > 0 ? (
          scheduleData[selectedDate].map((schedule) => (
            userRole === 'student' ? (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                navigation={navigation}
              />
            ) : (
              <TeacherScheduleCard
                key={schedule.id}
                schedule={schedule}
                navigation={navigation}
              />
            )
          ))
        ) : (
          <View className="items-center justify-center py-8">
            <Text className="text-gray-400 text-sm">Không có lịch học</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  weekDayButton: {
    width: 60,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  weekDayButtonWithSchedule: {
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  weekDayText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  weekDayTextSelected: {
    color: '#ffffff',
  },
  weekDayNum: {
    fontSize: 18,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  weekDayNumSelected: {
    color: '#ffffff',
  },
  weekDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fbbf24',
    marginTop: 4,
  },
});

export default WeekView;
