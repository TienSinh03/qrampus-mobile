import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import CourseCard from './CourseCard';

const BaseCoursesScreen = ({
  navigation,
  userRole = 'student',
  courses = [],
  isLoading = false,
  refreshing = false,
  onRefresh,
  onCoursePress,
  error = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [showSemesterSelector, setShowSemesterSelector] = useState(false);

  const roleColor = userRole === 'teacher' ? '#7c3aed' : '#2563eb';
  const roleLabel = userRole === 'teacher' ? 'Giảng viên' : 'Sinh viên';

  // Lọc khóa học theo tìm kiếm và học kỳ
  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.courseName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSemester = 
      selectedSemester === 'all' || course.semester === selectedSemester;
    
    return matchesSearch && matchesSemester;
  });

  // Lấy danh sách học kỳ có trong courses
  const semesters = ['all', ...new Set(courses.map(c => c.semester).filter(Boolean))];

  const handleCoursePress = useCallback((course) => {
    if (onCoursePress) {
      onCoursePress(course);
    } else {
      navigation.navigate('CourseDetail', { course });
    }
  }, [onCoursePress, navigation]);

  // Render semester filters
  const renderSemesterFilters = () => (
    <View className="mb-4">
      <TouchableOpacity
        onPress={() => setShowSemesterSelector(true)}
        className="bg-white rounded-xl px-4 py-3 flex-row items-center justify-between"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 3,
          elevation: 2,
        }}
      >
        <View className="flex-row items-center">
          <Ionicons name="funnel-outline" size={18} color="#6b7280" />
          <Text className="text-gray-900 font-medium ml-2">
            {selectedSemester === 'all' ? 'Tất cả học kỳ' : selectedSemester}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color="#6b7280" />
      </TouchableOpacity>

      <Modal
        visible={showSemesterSelector}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSemesterSelector(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowSemesterSelector(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-900 text-lg font-bold mb-4">Chọn học kỳ</Text>
            {semesters.map((semester, index) => {
              const isSelected = selectedSemester === semester;
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedSemester(semester);
                    setShowSemesterSelector(false);
                  }}
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-2 ${
                    isSelected ? 'bg-blue-50' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`text-base ${
                      isSelected ? 'text-blue-600 font-bold' : 'text-gray-900'
                    }`}
                  >
                    {semester === 'all' ? 'Tất cả' : semester}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={roleColor} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-gray-900 text-2xl font-bold">
          Khóa học
        </Text>
        <Text className="text-gray-500 text-sm mt-1">
          {userRole === 'teacher' 
            ? 'Các khóa học bạn đang giảng dạy' 
            : 'Các khóa học bạn đang tham gia'}
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-6 mb-4">
        <View 
          className="flex-row items-center bg-white rounded-xl px-4 py-3"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Tìm kiếm khóa học..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Ionicons 
              name="close-circle" 
              size={20} 
              color="#9ca3af" 
              onPress={() => setSearchQuery('')}
            />
          )}
        </View>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 z-10 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            <ActivityIndicator size="large" color={roleColor} />
            <Text className="text-gray-600 mt-3 text-center">Đang tải khóa học...</Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[roleColor]}
            tintColor={roleColor}
          />
        }
      >
        {/* Semester Filters */}
        {courses.length > 0 && renderSemesterFilters()}

        {/* Stats Summary */}
        {courses.length > 0 && (
          <View className="flex-row justify-between mb-4">
            <Text className="text-gray-600 text-sm">
              Hiển thị {filteredCourses.length} / {courses.length} khóa học
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <View className="flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="text-red-600 ml-2">{error}</Text>
            </View>
          </View>
        )}

        {/* Course List */}
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course, index) => (
            <CourseCard
              key={index}
              course={course}
              userRole={userRole}
              onPress={handleCoursePress}
            />
          ))
        ) : (
          <View className="bg-white rounded-2xl p-8 items-center justify-center">
            <Text className="text-gray-900 font-bold text-lg mb-1">
              {searchQuery 
                ? 'Không tìm thấy khóa học' 
                : 'Chưa có khóa học nào'}
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {searchQuery 
                ? 'Thử tìm kiếm với từ khóa khác' 
                : userRole === 'teacher'
                  ? 'Bạn chưa được phân công giảng dạy khóa học nào'
                  : 'Bạn chưa đăng ký khóa học nào'}
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});

export default BaseCoursesScreen;
