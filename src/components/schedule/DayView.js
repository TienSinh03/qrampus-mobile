import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScheduleCard from '../ScheduleCard';

const DayView = ({ 
  selectedDate, 
  scheduleData, 
  refreshing, 
  onRefresh, 
  onHeaderPress,
  onSchedulePress,
  navigation
}) => {
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    return `${dayName}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['chủ nhật', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy'];
    return days[date.getDay()];
  };

  return (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity 
          onPress={onHeaderPress}
          className="flex-row items-center justify-between"
        >
          <Text className="text-gray-900 font-semibold text-base">
            {formatDateHeader(selectedDate)}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <View className="px-6 py-4">
        {scheduleData[selectedDate] && scheduleData[selectedDate].length > 0 ? (
          scheduleData[selectedDate].map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onPress={() => onSchedulePress(schedule)}
              navigation={navigation}
            />
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-900 font-bold text-lg mb-1">
              Không có lịch học
            </Text>
            <Text className="text-gray-500 text-sm">
              Không có dữ liệu vào {getDayName(selectedDate)}, {selectedDate}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default DayView;
