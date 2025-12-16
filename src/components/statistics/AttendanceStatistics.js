import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AttendanceStatistics = ({ attendanceStats, studentCount }) => {
  const attendanceRate = studentCount > 0 
    ? ((attendanceStats.present / studentCount) * 100).toFixed(1)
    : 0;

  return (
    <View className="px-6 pb-6">
      <Text className="text-gray-900 font-bold text-lg mb-3">Thống kê điểm danh</Text>
      
      <View className="bg-white rounded-2xl p-4" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        {/* Attendance Rate Circle */}
        <View className="items-center mb-4">
          <View className="w-32 h-32 rounded-full bg-purple-50 items-center justify-center mb-2"
            style={{
              borderWidth: 8,
              borderColor: attendanceRate >= 80 ? '#10b981' : attendanceRate >= 50 ? '#f59e0b' : '#ef4444',
            }}
          >
            <Text className={`text-3xl font-bold ${
              attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 50 ? 'text-orange-600' : 'text-red-600'
            }`}>
              {attendanceRate}%
            </Text>
            <Text className="text-gray-500 text-xs">Tỷ lệ tham gia</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap">
          <View className="w-1/2 p-2">
            <View className="bg-green-50 rounded-xl p-3 items-center">
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              <Text className="text-green-700 text-2xl font-bold mt-1">
                {attendanceStats.present}
              </Text>
              <Text className="text-gray-600 text-xs">Có mặt</Text>
            </View>
          </View>
          
          <View className="w-1/2 p-2">
            <View className="bg-red-50 rounded-xl p-3 items-center">
              <Ionicons name="close-circle" size={32} color="#ef4444" />
              <Text className="text-red-700 text-2xl font-bold mt-1">
                {attendanceStats.absent}
              </Text>
              <Text className="text-gray-600 text-xs">Vắng</Text>
            </View>
          </View>
          
          <View className="w-1/2 p-2">
            <View className="bg-blue-50 rounded-xl p-3 items-center">
              <Ionicons name="document-text" size={32} color="#3b82f6" />
              <Text className="text-blue-700 text-2xl font-bold mt-1">
                {attendanceStats.excused}
              </Text>
              <Text className="text-gray-600 text-xs">Vắng có phép</Text>
            </View>
          </View>
          
          <View className="w-1/2 p-2">
            <View className="bg-gray-50 rounded-xl p-3 items-center">
              <Ionicons name="people-outline" size={32} color="#6b7280" />
              <Text className="text-gray-700 text-2xl font-bold mt-1">
                {studentCount}
              </Text>
              <Text className="text-gray-600 text-xs">Tổng SV</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Warning for low attendance */}
      {attendanceRate < 80 && (
        <View className="mt-4">
          <View className="bg-orange-50 rounded-xl p-4 flex-row items-start border-l-4 border-orange-500">
            <Ionicons name="warning" size={24} color="#f59e0b" />
            <View className="flex-1 ml-3">
              <Text className="text-orange-900 font-bold mb-1">Cảnh báo tỷ lệ tham gia</Text>
              <Text className="text-orange-700 text-sm">
                Tỷ lệ tham gia của lớp học đang thấp hơn 80%. Hãy khuyến khích sinh viên tham gia đầy đủ các buổi học.
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AttendanceStatistics;
