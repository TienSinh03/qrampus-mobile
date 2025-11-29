import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  RefreshControl, 
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { LocaleConfig } from 'react-native-calendars';
import ScheduleCard from '../../components/ScheduleCard';

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
        hasQR: false,
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

  // Định dạng ngày cho header
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const days = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
    const dayName = days[date.getDay()];
    return `${dayName}, ${date.getDate()}/${date.getMonth() + 1}`;
  };

  // lấy tên ngày trong tuần
  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const days = ['chủ nhật', 'thứ hai', 'thứ ba', 'thứ tư', 'thứ năm', 'thứ sáu', 'thứ bảy'];
    return days[date.getDay()];
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

  // View Day
  const renderDayView = () => (
    <ScrollView 
      contentContainerStyle={{ paddingBottom: 20 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-4 py-3 bg-white border-b border-gray-100">
        <TouchableOpacity 
          onPress={() => setViewMode('month')}
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
              onPress={() => handleSchedulePress(schedule)}
            />
          ))
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-6xl mb-3">📅</Text>
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

  // View Week
  const renderWeekView = () => {
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
                onPress={() => setSelectedDate(item.date)}
                style={[
                  styles.weekDayButton,
                  item.date === selectedDate && styles.weekDayButtonSelected,
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
          <View className="bg-blue-600 rounded-lg px-3 py-1 self-start mb-4">
            <Text className="text-white font-semibold text-sm">
              {formatDateHeader(selectedDate)}
            </Text>
          </View>

          {scheduleData[selectedDate] && scheduleData[selectedDate].length > 0 ? (
            scheduleData[selectedDate].map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onPress={() => handleSchedulePress(schedule)}
              />
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

  // View Month
  const renderMonthView = () => {
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
                onPress={() => openDatePicker('year')}
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
                  onPress={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(newDate.getMonth() - 1);
                    const newDateString = newDate.toISOString().split('T')[0];
                    setCurrentMonth(newDateString);
                    setSelectedDate(newDateString);
                  }}
                  className="p-2"
                >
                  <Ionicons name="chevron-back" size={20} color="#2563eb" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={() => openDatePicker('month')}
                  className="px-4 py-1 bg-blue-600 rounded-lg mx-2"
                >
                  <Text className="text-white font-semibold">
                    Tháng {currentMonthNum}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(newDate.getMonth() + 1);
                    const newDateString = newDate.toISOString().split('T')[0];
                    setCurrentMonth(newDateString);
                    setSelectedDate(newDateString);
                  }}
                  className="p-2"
                >
                  <Ionicons name="chevron-forward" size={20} color="#2563eb" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Calendar */}
          <Calendar
            key={currentMonth}
            current={currentMonth}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setViewMode('day');
            }}
            onMonthChange={(month) => {
              setCurrentMonth(month.dateString);
              setSelectedDate(month.dateString);
            }}
            markedDates={markedDates}
            enableSwipeMonths={true}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#6b7280',
              selectedDayBackgroundColor: '#2563eb',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#2563eb',
              dayTextColor: '#1f2937',
              textDisabledColor: '#d1d5db',
              dotColor: '#10b981',
              selectedDotColor: '#ffffff',
              arrowColor: '#2563eb',
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
      <View className="bg-white px-4 py-3 flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setViewMode('day')}
          className={`px-6 py-2 rounded-lg mr-2 ${
            viewMode === 'day' ? 'bg-blue-600' : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              viewMode === 'day' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Ngày
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('week')}
          className={`px-6 py-2 rounded-lg mr-2 ${
            viewMode === 'week' ? 'bg-blue-600' : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              viewMode === 'week' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Tuần
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setViewMode('month')}
          className={`px-6 py-2 rounded-lg ${
            viewMode === 'month' ? 'bg-blue-600' : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              viewMode === 'month' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Tháng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}

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
  weekDayButton: {
    width: 60,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  weekDayButtonSelected: {
    backgroundColor: '#2563eb',
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
