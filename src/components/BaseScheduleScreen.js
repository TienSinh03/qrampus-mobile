import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LocaleConfig } from 'react-native-calendars';
import DayView from './schedule/DayView';
import WeekView from './schedule/WeekView';
import MonthView from './schedule/MonthView';
import ViewModeSelector from './schedule/ViewModeSelector';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Cấu hình tiếng Việt cho calendar
LocaleConfig.locales['vi'] = {
  monthNames: [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ],
  monthNamesShort: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  dayNames: ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
  dayNamesShort: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
  today: 'Hôm nay'
};
LocaleConfig.defaultLocale = 'vi';

const BaseScheduleScreen = ({
  navigation,
  userRole = 'student', // 'student' or 'teacher'
  title = 'Lịch học/ lịch thi',
  scheduleData = {},
  currentDate: parentCurrentDate, // Current date từ parent
  currentViewMode: parentViewMode, // Current view mode từ parent
  isLoading = false, // Loading từ Redux
  error = null, // Error từ Redux
  onRefresh,
  onMonthChange, // Callback khi thay đổi tháng
  onViewModeChange, // Callback khi thay đổi view mode
  onDateSelect, // Callback khi user chọn ngày mới
}) => {
  const [viewMode, setViewMode] = useState(parentViewMode || 'month');
  const [selectedDate, setSelectedDate] = useState(
    parentCurrentDate || new Date().toISOString().split('T')[0]
  );
  const [currentMonth, setCurrentMonth] = useState(
    parentCurrentDate || new Date().toISOString().split('T')[0]
  );
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('month');
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const roleColor = userRole === 'teacher' ? '#7c3aed' : '#2563eb';

  // Sync state khi parent thay đổi
  useEffect(() => {
    if (parentCurrentDate) {
      setSelectedDate(parentCurrentDate);
      setCurrentMonth(parentCurrentDate);
    }
  }, [parentCurrentDate]);

  useEffect(() => {
    if (parentViewMode) {
      setViewMode(parentViewMode);
    }
  }, [parentViewMode]);

  // Notify parent khi view mode thay đổi
  const handleViewModeChange = (newMode) => {
    setViewMode(newMode);
    if (onViewModeChange) {
      onViewModeChange(newMode);
    }
  };

  // Tạo marked dates cho calendar
  const markedDates = {};
  Object.keys(scheduleData).forEach(date => {
    markedDates[date] = {
      marked: true,
      dotColor: '#10b981',
      selected: date === selectedDate,
      selectedColor: roleColor,
    };
  });

  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: roleColor,
    };
  }

  const handleRefresh = () => {
    setRefreshing(true);
    if (onRefresh) {
      onRefresh(() => setRefreshing(false));
    } else {
      setTimeout(() => setRefreshing(false), 1500);
    } 
  };

  const openDatePicker = (mode) => {
    setPickerMode(mode);
    setShowDatePicker(true);
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 90,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDatePicker = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDatePicker(false);
    });
  };

  const getYearRange = (currentYear) => {
    const years = [];
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const handleYearSelect = (year) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    const newDateString = newDate.toISOString().split('T')[0];
    setCurrentMonth(newDateString);
    // Notify parent để fetch data mới
    if (onMonthChange) {
      onMonthChange(newDateString);
    }
    closeDatePicker();
  };

  const handleMonthSelect = (month) => {
    const date = new Date(currentMonth);
    const currentYear = date.getFullYear();
    const newDate = new Date(Date.UTC(currentYear, month - 1, 1));
    const newDateString = newDate.toISOString().split('T')[0];
    setCurrentMonth(newDateString);
    setSelectedDate(newDateString);
    // Notify parent để fetch data mới
    if (onMonthChange) {
      onMonthChange(newDateString);
    }
    closeDatePicker();
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    const newDateString = newDate.toISOString().split('T')[0];
    setCurrentMonth(newDateString);
    setSelectedDate(newDateString);
    // Notify parent để fetch data mới
    if (onMonthChange) {
      onMonthChange(newDateString);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    const newDateString = newDate.toISOString().split('T')[0];
    setCurrentMonth(newDateString);
    setSelectedDate(newDateString);
    // Notify parent để fetch data mới
    if (onMonthChange) {
      onMonthChange(newDateString);
    }
  };

  const handleDayPress = (day) => {
    const newDate = day.dateString;
    
    setSelectedDate(newDate);
    handleViewModeChange('day');
    
    // Notify parent để update currentDate và fetch data nếu cần
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const handleInternalMonthChange = (month) => {
    setCurrentMonth(month.dateString);
    setSelectedDate(month.dateString);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View 
        className="px-4 py-3"
        style={{ backgroundColor: roleColor }}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">
            {title}
          </Text>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* View Mode Selector */}
      <ViewModeSelector 
        viewMode={viewMode} 
        onViewModeChange={handleViewModeChange}
        userRole={userRole}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 z-10 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            <ActivityIndicator size="large" color={roleColor} />
            <Text className="text-gray-600 mt-3 text-center">Đang tải lịch học...</Text>
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && !isLoading && (
        <View className="mx-4 mt-2 p-4 bg-red-50 rounded-xl border border-red-200">
          <View className="flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#ef4444" />
            <Text className="text-red-600 ml-2 flex-1">{error}</Text>
          </View>
        </View>
      )}

      {/* Content */}
      {viewMode === 'day' && (
        <DayView
          selectedDate={selectedDate}
          scheduleData={scheduleData}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onHeaderPress={() => handleViewModeChange('month')}
          navigation={navigation}
          userRole={userRole}
        />
      )}
      {viewMode === 'week' && (
        <WeekView
          selectedDate={selectedDate}
          scheduleData={scheduleData}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onSetDateSelect={setSelectedDate}
          navigation={navigation}
          themeColor={roleColor}
          userRole={userRole}
        />
      )}
      {viewMode === 'month' && (
        <MonthView
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          markedDates={markedDates}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onYearPress={() => openDatePicker('year')}
          onMonthPress={() => openDatePicker('month')}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDayPress={handleDayPress}
          onMonthChange={handleInternalMonthChange}
          themeColor={roleColor}
        />
      )}

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="none"
        onRequestClose={closeDatePicker}
      >
        <TouchableWithoutFeedback onPress={closeDatePicker}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View className="bg-white rounded-t-3xl">
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            <View className="px-6 py-3 border-b border-gray-200">
              <Text className="text-gray-900 text-xl font-bold">
                {pickerMode === 'year' ? 'Chọn năm' : 'Chọn tháng'}
              </Text>
            </View>

            <ScrollView 
              style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}
              showsVerticalScrollIndicator={false}
            >
              {pickerMode === 'year' ? (
                <View className="px-6 py-4">
                  {getYearRange(new Date(currentMonth).getFullYear()).map((year) => {
                    const isSelected = year === new Date(currentMonth).getFullYear();
                    return (
                      <TouchableOpacity
                        key={year}
                        onPress={() => handleYearSelect(year)}
                        className={`py-4 px-4 mb-2 rounded-xl`}
                        style={{ backgroundColor: isSelected ? roleColor : '#f9fafb' }}
                      >
                        <Text
                          className={`text-center text-lg font-semibold ${
                            isSelected ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {year}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View className="px-6 py-4">
                  <View className="flex-row flex-wrap justify-between">
                    {[
                      { num: 1, name: 'Tháng 1' },
                      { num: 2, name: 'Tháng 2' },
                      { num: 3, name: 'Tháng 3' },
                      { num: 4, name: 'Tháng 4' },
                      { num: 5, name: 'Tháng 5' },
                      { num: 6, name: 'Tháng 6' },
                      { num: 7, name: 'Tháng 7' },
                      { num: 8, name: 'Tháng 8' },
                      { num: 9, name: 'Tháng 9' },
                      { num: 10, name: 'Tháng 10' },
                      { num: 11, name: 'Tháng 11' },
                      { num: 12, name: 'Tháng 12' },
                    ].map((month) => {
                      const isSelected = month.num === new Date(currentMonth).getMonth() + 1;
                      return (
                        <TouchableOpacity
                          key={month.num}
                          onPress={() => handleMonthSelect(month.num)}
                          style={{ 
                            width: '31%', 
                            marginBottom: 12,
                            backgroundColor: isSelected ? roleColor : '#f9fafb'
                          }}
                          className="py-4 rounded-xl"
                        >
                          <Text
                            className={`text-center font-semibold ${
                              isSelected ? 'text-white' : 'text-gray-900'
                            }`}
                          >
                            {month.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </ScrollView>

            <View className="px-6 py-4 border-t border-gray-200">
              <TouchableOpacity
                onPress={closeDatePicker}
                className="bg-gray-100 py-3 rounded-xl"
              >
                <Text className="text-center text-gray-700 font-semibold">
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default BaseScheduleScreen;
