import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';

const MonthView = ({ 
  currentMonth,
  selectedDate,
  markedDates,
  refreshing,
  onRefresh,
  onYearPress,
  onMonthPress,
  onPrevMonth,
  onNextMonth,
  onDayPress,
  onMonthChange,
  themeColor
}) => {
  const currentYear = new Date(currentMonth).getFullYear();
  const currentMonthNum = new Date(currentMonth).getMonth() + 1;

  return (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="bg-white">
        {/* Year and Month Selector */}
        <View className="px-4 py-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            {/* Year Selector */}
            <TouchableOpacity 
              onPress={onYearPress}
              className="flex-row items-center"
            >
              <Text className="text-gray-900 font-semibold text-base mr-1">
                {currentYear}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#6b7280" />
            </TouchableOpacity>

            {/* Month Selector */}
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={onPrevMonth}
                className="p-2"
              >
                <Ionicons name="chevron-back" size={20} color={themeColor} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={onMonthPress}
                className="px-4 py-1  rounded-lg mx-2"
                style={{ backgroundColor: themeColor }}
              >
                <Text className="text-white font-semibold">
                  Tháng {currentMonthNum}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={onNextMonth}
                className="p-2"
              >
                <Ionicons name="chevron-forward" size={20} color={themeColor} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Calendar */}
        <Calendar
          key={currentMonth}
          current={currentMonth}
          onDayPress={onDayPress}
          onMonthChange={onMonthChange}
          markedDates={markedDates}
          enableSwipeMonths={true}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#6b7280',
            selectedDayBackgroundColor: themeColor,
            selectedDayTextColor: '#ffffff',
            todayTextColor: themeColor,
            dayTextColor: '#1f2937',
            textDisabledColor: '#d1d5db',
            dotColor: '#10b981',
            selectedDotColor: '#ffffff',
            arrowColor: themeColor,
            monthTextColor: '#1f2937',
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '400',
            textMonthFontWeight: '600',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 14,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 12,
          }}
        />
      </View>

      {/* Legend */}
      <View className="px-6 py-4 flex-row items-center flex-wrap">
        <View className="flex-row items-center mr-4 mb-2">
          <View className="w-3 h-3 rounded-full bg-green-500 mr-2" />
          <Text className="text-gray-600 text-sm">Lịch học</Text>
        </View>
        <View className="flex-row items-center mr-4 mb-2">
          <View className="w-3 h-3 rounded-full bg-yellow-400 mr-2" />
          <Text className="text-gray-600 text-sm">Lịch thi</Text>
        </View>
        <View className="flex-row items-center mr-4 mb-2">
          <View className="w-3 h-3 rounded-full bg-blue-600 mr-2" />
          <Text className="text-gray-600 text-sm">Lịch trực tuyến</Text>
        </View>
        <View className="flex-row items-center mb-2">
          <View className="w-3 h-3 rounded-full bg-red-500 mr-2" />
          <Text className="text-gray-600 text-sm">Tạm ngưng</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default MonthView;
