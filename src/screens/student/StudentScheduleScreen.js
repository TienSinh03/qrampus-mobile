import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LocaleConfig } from 'react-native-calendars';
import DayView from '../../components/schedule/DayView';
import WeekView from '../../components/schedule/WeekView';
import MonthView from '../../components/schedule/MonthView';
import ViewModeSelector from '../../components/schedule/ViewModeSelector';

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

const StudentScheduleScreen = ({ navigation }) => {
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('month'); // 'year' or 'month'
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Mock data - thay bằng API call
  const scheduleData = {
    '2025-01-06': [
      {
        id: '1',
        courseName: 'Lập trình Di động',
        courseCode: 'IT4788',
        room: 'D3-201',
        startTime: '07:00',
        endTime: '09:00',
        teacherName: 'TS. Nguyễn Văn A',
        hasQR: true,
      },
    ],
    '2025-01-07': [
      {
        id: '2',
        courseName: 'Trí tuệ Nhân tạo',
        courseCode: 'IT4868',
        room: 'D5-302',
        startTime: '09:15',
        endTime: '11:15',
        teacherName: 'PGS.TS. Trần Thị B',
        hasQR: false,
      },
    ],
    '2025-01-09': [
      {
        id: '3',
        courseName: 'Cơ sở dữ liệu',
        courseCode: 'IT4420',
        room: 'D9-101',
        startTime: '13:00',
        endTime: '15:00',
        teacherName: 'TS. Lê Văn C',
        hasQR: false,
      },
    ],
  };

  // Tạo marked dates cho calendar
  const markedDates = {};
  Object.keys(scheduleData).forEach(date => {
    markedDates[date] = {
      marked: true,
      dotColor: '#10b981',
      selected: date === selectedDate,
      selectedColor: '#2563eb',
    };
  });

  // Nếu ngày được chọn không có schedule, vẫn highlight
  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: '#2563eb',
    };
  }

  const handleSchedulePress = (schedule) => {
    console.log('Schedule pressed:', schedule);
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
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

  // Lấy danh sách năm cho year picker
  const getYearRange = (currentYear) => {
    const years = [];
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  // Xử lý chọn năm
  const handleYearSelect = (year) => {
    const newDate = new Date(currentMonth);
    newDate.setFullYear(year);
    setCurrentMonth(newDate.toISOString().split('T')[0]);
    closeDatePicker();
  };

  // Xử lý chọn tháng
  const handleMonthSelect = (month) => {
    const date = new Date(currentMonth);
    const currentYear = date.getFullYear();
    const newDate = new Date(Date.UTC(currentYear, month - 1, 1));
    const newDateString = newDate.toISOString().split('T')[0];
    setCurrentMonth(newDateString);
    setSelectedDate(newDateString);
    closeDatePicker();
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    const newDateString = newDate.toISOString().split('T')[0];
    setCurrentMonth(newDateString);
    setSelectedDate(newDateString);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    const newDateString = newDate.toISOString().split('T')[0];
    setCurrentMonth(newDateString);
    setSelectedDate(newDateString);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    setViewMode('day');
  };

  const handleMonthChange = (month) => {
    setCurrentMonth(month.dateString);
    setSelectedDate(month.dateString);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View className="bg-blue-600 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">
            Lịch học/ lịch thi
          </Text>
          <TouchableOpacity>
            <Ionicons name="menu" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* View Mode Selector */}
      <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Content */}
      {viewMode === 'day' && (
        <DayView
          selectedDate={selectedDate}
          scheduleData={scheduleData}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onHeaderPress={() => setViewMode('month')}
          onSchedulePress={handleSchedulePress}
          navigation={navigation}
        />
      )}
      {viewMode === 'week' && (
        <WeekView
          selectedDate={selectedDate}
          scheduleData={scheduleData}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onSetDateSelect={setSelectedDate}
          onSchedulePress={handleSchedulePress}
          navigation={navigation}
        />
      )}
      {viewMode === 'month' && (
        <MonthView
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          markedDates={markedDates}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onYearPress={() => openDatePicker('year')}
          onMonthPress={() => openDatePicker('month')}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
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
            {/* Handle Bar */}
            <View className="items-center py-3">
              <View className="w-12 h-1 bg-gray-300 rounded-full" />
            </View>

            {/* Header */}
            <View className="px-6 py-3 border-b border-gray-200">
              <Text className="text-gray-900 text-xl font-bold">
                {pickerMode === 'year' ? 'Chọn năm' : 'Chọn tháng'}
              </Text>
            </View>

            {/* Content */}
            <ScrollView 
              style={{ maxHeight: SCREEN_HEIGHT * 0.6 }}
              showsVerticalScrollIndicator={false}
            >
              {pickerMode === 'year' ? (
                // Year Picker
                <View className="px-6 py-4">
                  {getYearRange(new Date(currentMonth).getFullYear()).map((year) => {
                    const isSelected = year === new Date(currentMonth).getFullYear();
                    return (
                      <TouchableOpacity
                        key={year}
                        onPress={() => handleYearSelect(year)}
                        className={`py-4 px-4 mb-2 rounded-xl ${
                          isSelected ? 'bg-blue-600' : 'bg-gray-50'
                        }`}
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
                // Month Picker
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
                          style={{ width: '31%', marginBottom: 12 }}
                          className={`py-4 rounded-xl ${
                            isSelected ? 'bg-blue-600' : 'bg-gray-50'
                          }`}
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

            {/* Footer */}
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

export default StudentScheduleScreen;
