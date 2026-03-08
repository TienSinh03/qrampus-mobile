import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SessionDetailModal from '../../components/modal/SessionDetailModal';
import useCollapsibleHeader from '../../hooks/useCollapsibleHeader';

const { width } = Dimensions.get('window');
const SessionListScreen = ({ navigation, route }) => {
  const { animatedHeight, animatedOpacity, animatedTranslateY, handleScroll, handleMomentumScrollBegin } = useCollapsibleHeader(width * 0.45);
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
      const [startHourNum, startMinute] = schedule.startHour.split(':').map(Number);

      
      const classTime = new Date();
      classTime.setHours(startHourNum, startMinute, 0, 0);
      
      const diffMs = classTime - now;
      const diffMinutes = Math.floor(diffMs / 60000);
      
      // Check if within ±5 minutes
      const inWindow = diffMinutes >= -5 && diffMinutes <= 5;
      setIsInActiveWindow(inWindow);
    };

    checkActiveWindow();
    const interval = setInterval(checkActiveWindow, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, [schedule.startHour]);

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
      {
        id: 4,
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
      {
        id: 4,
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
      {
        id: 4,
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
        <View className="flex-row items-center justify-between">
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
        <Animated.View
          style={{
            height: animatedHeight,
            opacity: animatedOpacity,
            transform: [{ translateY: animatedTranslateY }],
            overflow: 'hidden'
          }}
        >
          {/* Action Buttons */}
          <View className="mt-3">
            {/* Student List Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('StudentList', { schedule })}
              className="bg-white rounded-xl mb-2 overflow-hidden"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center p-4">
                <View className="w-12 h-12 bg-purple-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="people" size={24} color="#7c3aed" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base mb-0.5">Danh sách sinh viên</Text>
                  <Text className="text-gray-500 text-xs">Xem và quản lý sinh viên trong lớp</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
              </View>
            </TouchableOpacity>

            {/* Create Session Button or Status */}
            {isInActiveWindow && !schedule.hasActiveSession && (
              <TouchableOpacity
                onPress={handleCreateNewSession}
                activeOpacity={0.8}
                className="rounded-xl overflow-hidden"
                style={{
                  shadowColor: '#7c3aed',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 6,
                  elevation: 5,
                }}
              >
                <LinearGradient
                  colors={['#7c3aed', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-row items-center p-4"
                >
                  <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-3">
                    <Ionicons name="qr-code" size={26} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base mb-0.5">Tạo phiên điểm danh</Text>
                    <Text className="text-white/80 text-xs">Tạo QR code để sinh viên điểm danh</Text>
                  </View>
                  <Ionicons name="add-circle" size={28} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isInActiveWindow && schedule.hasActiveSession && (
              <View 
                className="rounded-xl overflow-hidden"
                style={{
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <LinearGradient
                  colors={['#10b981', '#34d399']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="flex-row items-center p-4"
                >
                  <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-3">
                    <View className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base mb-0.5">Phiên đang hoạt động</Text>
                    <Text className="text-white/80 text-xs">Sinh viên đang điểm danh</Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={28} color="white" />
                </LinearGradient>
              </View>
            )}

            {!isInActiveWindow && (
              <View className="bg-white/10 rounded-xl p-4 flex-row items-center">
                <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="time-outline" size={22} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white/90 font-semibold text-sm mb-0.5">
                    Chưa đến giờ tạo phiên
                  </Text>
                  <Text className="text-white/60 text-xs">
                    Bạn có thể tạo phiên trong khoảng ±15 phút
                  </Text>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Sessions List */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onMomentumScrollBegin={handleMomentumScrollBegin}
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
      <SessionDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        session={selectedSession}
      />
    </SafeAreaView>
  );
};

export default SessionListScreen;
