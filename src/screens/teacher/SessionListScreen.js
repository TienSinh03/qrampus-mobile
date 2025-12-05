import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SessionListScreen = ({ navigation, route }) => {
  const { schedule } = route.params;

  const [sessions, setSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isInActiveWindow, setIsInActiveWindow] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Check if current time is within ±5 minutes of class start time
  useEffect(() => {
    const checkActiveWindow = () => {
      const now = new Date();
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      
      const classTime = new Date();
      classTime.setHours(startHour, startMinute, 0, 0);
      
      const diffMs = classTime - now;
      const diffMinutes = Math.floor(diffMs / 60000);
      
      // Check if within ±5 minutes
      const inWindow = diffMinutes >= -5 && diffMinutes <= 5;
      setIsInActiveWindow(inWindow);
    };

    checkActiveWindow();
    const interval = setInterval(checkActiveWindow, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, [schedule.startTime]);

  // Fetch sessions for this schedule
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    // Call API to get attendance_sessions for this teaching_schedule_id
    const mockSessions = [
      {
        id: 1,
        created_at: '2025-12-03 07:02:00',
        created_by_name: 'TS. Nguyễn Văn A',
        created_by_id: 101,
        session_duration_minutes: 5,
        status: 'expired',
        quorum_met: true,
        total_attended: 42,
        total_students: 45,
        attendance_rate: 93.3,
        attendances: [
          { id: 1, student_name: 'Nguyễn Văn A', student_id: '20200001', scan_time: '2025-12-03 07:02:15', valid: true },
          { id: 2, student_name: 'Trần Thị B', student_id: '20200002', scan_time: '2025-12-03 07:02:30', valid: true },
          { id: 3, student_name: 'Lê Văn C', student_id: '20200003', scan_time: '2025-12-03 07:03:45', valid: true },
        ],
      },
      {
        id: 2,
        created_at: '2025-11-26 07:01:00',
        created_by_name: 'PGS. Trần Thị B',
        created_by_id: 102,
        session_duration_minutes: 3,
        status: 'expired',
        quorum_met: true,
        total_attended: 40,
        total_students: 45,
        attendance_rate: 88.9,
        attendances: [],
      },
      {
        id: 3,
        created_at: '2025-11-19 07:03:00',
        created_by_name: 'TS. Nguyễn Văn A',
        created_by_id: 101,
        session_duration_minutes: 5,
        status: 'expired',
        quorum_met: false,
        total_attended: 28,
        total_students: 45,
        attendance_rate: 62.2,
        attendances: [],
      },
    ];

    setSessions(mockSessions);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  };

  // Tạo phiên điểm danh mới
  const handleCreateNewSession = () => {
    navigation.navigate('CreateQRSession', { 
      schedule,
      isNewSession: true,
    });
    console.log('Creating new session for schedule:', schedule.id);
  };

  // Xem chi tiết phiên điểm danh
  const handleViewSessionDetail = (session) => {
    if (session.status === 'active') {
      navigation.navigate('CreateQRSession', { 
        schedule,
        sessionId: session.id,
        isNewSession: false,
      });
        console.log('Viewing active session:', session.id);
    } else {
      // Hiển thị modal chi tiết cho các phiên đã kết thúc
      setSelectedSession(session);
      setShowDetailModal(true);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      case 'invalid':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'expired':
        return 'Đã kết thúc';
      case 'invalid':
        return 'Không hợp lệ';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">{schedule.courseName}</Text>
            <Text className="text-white/80 text-sm">
              {schedule.courseCode} • {schedule.room}
            </Text>
          </View>
        </View>

        {/* Create Session Button*/}
        {isInActiveWindow && (
          <TouchableOpacity
            onPress={handleCreateNewSession}
            className="bg-white rounded-xl py-3.5 flex-row items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Ionicons name="qr-code" size={22} color="#7c3aed" />
            <Text className="text-purple-600 font-bold text-base ml-2">
              Tạo phiên điểm danh mới
            </Text>
          </TouchableOpacity>
        )}

        {!isInActiveWindow && (
          <View className="bg-white/10 rounded-xl py-3 flex-row items-center justify-center">
            <Ionicons name="time-outline" size={18} color="white" />
            <Text className="text-white/70 text-sm ml-2">
              Chưa đến giờ tạo phiên (±5 phút)
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Sessions List */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text className="text-gray-900 text-lg font-bold mb-3">
          Lịch sử phiên điểm danh
        </Text>

        {sessions.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center justify-center">
            <Text className="text-gray-900 font-bold text-lg mb-1">
              Chưa có phiên điểm danh
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Tạo phiên điểm danh mới khi đến giờ học
            </Text>
          </View>
        ) : (
          sessions.map((session, index) => (
            <TouchableOpacity
              key={session.id}
              onPress={() => handleViewSessionDetail(session)}
              className={`bg-white rounded-2xl p-4 mb-3 ${
                index === 0 && session.status === 'active' ? 'border-2 border-green-400' : ''
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-1">
                    {formatDateTime(session.created_at)}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    Tạo bởi: {session.created_by_name}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(session.status)}`}>
                  <Text className="text-xs font-semibold">
                    {getStatusText(session.status)}
                  </Text>
                </View>
              </View>

              {/* Information stats */}
              <View className="flex-row items-center mb-3">
                <View className="flex-row items-center mr-4">
                  <Ionicons name="time-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {session.session_duration_minutes} phút
                  </Text>
                </View>
                <View className="flex-row items-center mr-4">
                  <Ionicons name="people-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {session.total_attended}/{session.total_students}
                  </Text>
                </View>
                <View className="flex-1" />
                <Text
                  className={`font-bold ${
                    session.attendance_rate >= 80 ? 'text-green-600'
                      : session.attendance_rate >= 60 ? 'text-orange-600' : 'text-red-600'
                  }`}
                >
                  {session.attendance_rate.toFixed(1)}%
                </Text>
              </View>

              {/* Quorum */}
              <View
                className={`rounded-lg p-2 flex-row items-center ${
                  session.quorum_met ? 'bg-green-50' : 'bg-orange-50'
                }`}
              >
                <Ionicons
                  name={session.quorum_met ? 'checkmark-circle' : 'alert-circle'}
                  size={16}
                  color={session.quorum_met ? '#10b981' : '#f59e0b'}
                />
                <Text
                  className={`ml-2 text-xs font-semibold ${
                    session.quorum_met ? 'text-green-700' : 'text-orange-700'
                  }`}
                >
                  {session.quorum_met ? 'Đạt quorum' : 'Không đạt quorum'}
                </Text>
              </View>

              {/* Active Session Indicator */}
              {session.status === 'active' && (
                <View className="mt-3 flex-row items-center">
                  <View className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  <Text className="text-green-600 text-sm font-semibold">
                    Nhấn để xem phiên đang hoạt động
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Session Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Chi tiết phiên điểm danh
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedSession && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Session Info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-600 text-sm">Thời gian tạo</Text>
                    <Text className="text-gray-900 font-semibold">
                      {formatDateTime(selectedSession.created_at)}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-600 text-sm">Giảng viên tạo</Text>
                    <Text className="text-gray-900 font-semibold">
                      {selectedSession.created_by_name}
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-600 text-sm">Thời lượng</Text>
                    <Text className="text-gray-900 font-semibold">
                      {selectedSession.session_duration_minutes} phút
                    </Text>
                  </View>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600 text-sm">Trạng thái</Text>
                    <View className={`px-3 py-1 rounded-full ${getStatusColor(selectedSession.status)}`}>
                      <Text className="text-xs font-semibold">
                        {getStatusText(selectedSession.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Statistics */}
                <View className="bg-white rounded-xl p-4 mb-4" style={{ elevation: 2 }}>
                  <Text className="text-gray-900 font-bold mb-3">Thống kê</Text>
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-1 items-center">
                      <Text className="text-2xl font-bold text-purple-600">
                        {selectedSession.total_attended}
                      </Text>
                      <Text className="text-gray-500 text-xs">Đã điểm danh</Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-2xl font-bold text-gray-400">
                        {selectedSession.total_students - selectedSession.total_attended}
                      </Text>
                      <Text className="text-gray-500 text-xs">Vắng</Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-2xl font-bold text-blue-600">
                        {selectedSession.attendance_rate.toFixed(1)}%
                      </Text>
                      <Text className="text-gray-500 text-xs">Tỷ lệ</Text>
                    </View>
                  </View>

                  <View
                    className={`rounded-lg p-2 flex-row items-center ${
                      selectedSession.quorum_met ? 'bg-green-50' : 'bg-orange-50'
                    }`}
                  >
                    <Ionicons
                      name={selectedSession.quorum_met ? 'checkmark-circle' : 'alert-circle'}
                      size={16}
                      color={selectedSession.quorum_met ? '#10b981' : '#f59e0b'}
                    />
                    <Text
                      className={`ml-2 text-xs font-semibold ${
                        selectedSession.quorum_met ? 'text-green-700' : 'text-orange-700'
                      }`}
                    >
                      {selectedSession.quorum_met ? 'Đạt yêu cầu quorum (≥2/3)' : 'Không đạt quorum'}
                    </Text>
                  </View>
                </View>

                {/* Attendance List */}
                {selectedSession.attendances && selectedSession.attendances.length > 0 && (
                  <View>
                    <Text className="text-gray-900 font-bold mb-3">
                      Danh sách điểm danh ({selectedSession.attendances.length})
                    </Text>
                    <View className="bg-white rounded-xl p-4" style={{ elevation: 2 }}>
                      {selectedSession.attendances.map((attendance, index) => (
                        <View
                          key={attendance.id}
                          className={`flex-row items-center py-3 ${
                            index !== 0 ? 'border-t border-gray-100' : ''
                          }`}
                        >
                          <View
                            className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                              attendance.valid ? 'bg-green-100' : 'bg-red-100'
                            }`}
                          >
                            <Ionicons
                              name={attendance.valid ? 'checkmark' : 'close'}
                              size={20}
                              color={attendance.valid ? '#10b981' : '#ef4444'}
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-gray-900 font-semibold">
                              {attendance.student_name}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                              {attendance.student_id}
                            </Text>
                          </View>
                          <Text className="text-gray-400 text-xs">
                            {new Date(attendance.scan_time).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SessionListScreen;
