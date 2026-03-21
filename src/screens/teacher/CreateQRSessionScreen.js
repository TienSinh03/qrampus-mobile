import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import QRHistoryModal from '../../components/modal/QRHistoryModal';
import { useDispatch, useSelector } from 'react-redux';

import {
  createAttendanceSessionThunk,
  closeAttendanceSessionThunk,
  getNextQRThunk,
  getAttendanceHistoryThunk,
  getAttendanceSessionStatsThunk,
} from '../../features/attendanceSession/attendanceSessionThunks';

import {
  selectActiveSession,
  selectCurrentQR,
  selectClassInfo,
  selectCreateLoading,
  selectCreateError,
  selectCloseLoading,
  clearActiveSession,
  selectSessions,
  setActiveSession,
  selectLiveScanEvent,
} from '../../features/attendanceSession/attendanceSessionSlice';

import { setScheduleHasActiveSession } from '../../features/teacher/teacherSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CreateQRSessionScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { schedule, isNewSession = true, sessionId: existingSessionId = null } = route.params;

  // Redux state
  const activeSession = useSelector(selectActiveSession);
  const currentQR = useSelector(selectCurrentQR);
  const classInfo = useSelector(selectClassInfo);
  const createLoading = useSelector(selectCreateLoading);
  const createError = useSelector(selectCreateError);
  const closeLoading = useSelector(selectCloseLoading);
  const qrHistory = useSelector(selectSessions);
  const liveScanEvent = useSelector(selectLiveScanEvent);

  // Session state
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(null);
  
  // Timing state
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [qrTimeRemaining, setQrTimeRemaining] = useState(10);
  
  // Attendance state
  const [attendedStudents, setAttendedStudents] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [frequentAbsentees, setFrequentAbsentees] = useState([]);
  
  // UI state
  const [showDurationModal, setShowDurationModal] = useState(isNewSession);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  
  const qrScaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => { dispatch(clearActiveSession()); };
  }, []);

  // Load QR history for this course
  useEffect(() => {
    if (schedule.courseSectionId) {
      dispatch(getAttendanceHistoryThunk({ course_section_id: schedule.courseSectionId, limit: 20 }));
    }
  }, [schedule.courseSectionId]);

  // Show error alert
  useEffect(() => {
    if (createError) {
      Alert.alert('Lỗi', createError);
    }
  }, [createError]);

  // Restore state khi xem lại phiên đang hoạt động
  useEffect(() => {
    if (isNewSession || !existingSessionId) return;

    // Chờ đến khi history được load
    const existingSession = qrHistory.find(s => s.id === existingSessionId);
    if (!existingSession || existingSession.status !== 'active') return;

    // Tính thời gian còn lại
    const expiresAt = new Date(existingSession.expires_at);
    const now = new Date();
    const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));

    if (remaining <= 0) return;

    // Khôi phục session vào Redux
    dispatch(setActiveSession({ id: existingSession.id }));
    setSelectedDuration(existingSession.session_duration_minutes);
    setTimeRemaining(remaining);
    setQrTimeRemaining(10);
    setSessionActive(true);

    // Lấy QR mới ngay lập tức
    dispatch(getNextQRThunk(existingSessionId)).catch(() => {});
  }, [isNewSession, existingSessionId, qrHistory]);

  // Bắt đầu phiên điểm danh với thời gian đã chọn
  const handleStartSession = async (duration) => {
    setSelectedDuration(duration);
    setShowDurationModal(false);

    try {
      const result = await dispatch(createAttendanceSessionThunk({
        class_session_id: schedule.id,
        session_duration_minutes: duration,
        qr_interval: 10,
      })).unwrap();

      setSessionActive(true);
      setTimeRemaining(duration * 60);
      setQrTimeRemaining(10);
      animateQR();

      // Cập nhật hasActiveSession trong Redux để TeacherScheduleCard hiển thị realtime
      dispatch(setScheduleHasActiveSession({
        classSessionId: schedule.id,
        hasActiveSession: true
      }));
    } catch (err) {
      // Error handled by createError useEffect
      setShowDurationModal(true);
    }
  };

  const animateQR = () => {
    Animated.sequence([
      Animated.timing(qrScaleAnim, {
        toValue: 0.9,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(qrScaleAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Fetch next QR
  const fetchNextQR = useCallback(async () => {
    if (!activeSession?.id) return;
    try {
      await dispatch(getNextQRThunk(activeSession.id)).unwrap();
      animateQR();
    } catch (err) {
      // Session may have expired on server
      if (err?.includes?.('hết hạn') || err?.includes?.('expired')) {
        endSession();
      }
    }
  }, [activeSession?.id]);

  // Đồng bộ thống kê điểm danh realtime từ server
  const syncAttendanceStats = useCallback(async () => {
    if (!activeSession?.id) return;

    try {
      const data = await dispatch(getAttendanceSessionStatsThunk(activeSession.id)).unwrap();
      const attendedList = (data?.attendances || []).map((item) => ({
        id: item.student?.id || item.id,
        name: item.student?.full_name || 'Sinh viên',
        studentId: item.student?.student_code || 'N/A',
        scanTime: item.scan_time,
      }));

      setAttendedStudents(attendedList);
      setTotalStudents(data?.stats?.total || 0);
    } catch (err) {
      // Khi phiên đã hết hạn hoặc không đủ quyền thì bỏ qua để không làm gián đoạn UI
    }
  }, [activeSession?.id, dispatch]);

  // Áp dụng event get stats attendance realtime từ socket
  const applyRealtimeScanEvent = useCallback((eventPayload) => {
    const meta = eventPayload?.metadata;
    const student = meta?.student;
    if (!student) return;

    const nextItem = {
      id: student.id || meta?.attendance_id,
      name: student.full_name || 'Sinh viên',
      studentId: student.student_code || 'N/A',
      scanTime: meta?.scan_time || new Date().toISOString(),
    };

    setAttendedStudents((prev) => {
      const exists = prev.some((item) => item.studentId === nextItem.studentId);
      if (exists) {
        return prev;
      }
      return [nextItem, ...prev];
    });

    if (typeof meta?.stats?.total === 'number') {
      setTotalStudents(meta.stats.total);
    }
  }, []);

  // Thời gian đếm ngược cho phiên và QR
  useEffect(() => {
    if (!sessionActive || !activeSession?.id) return;

    const interval = setInterval(() => {
      // Phiên kết thúc
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          endSession();
          return 0;
        }
        return prev - 1;
      });

      // QR hết hạn, gọi API lấy QR mới
      setQrTimeRemaining((prev) => {
        if (prev <= 1) {
          fetchNextQR();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionActive, activeSession?.id, fetchNextQR]);

  // Fallback polling thưa để đồng bộ khi mất event socket (tiết kiệm request)
  useEffect(() => {
    if (!sessionActive || !activeSession?.id) return;

    syncAttendanceStats();
    const interval = setInterval(syncAttendanceStats, 15000);

    return () => clearInterval(interval);
  }, [sessionActive, activeSession?.id, syncAttendanceStats]);

  // Realtime: khi có event sinh viên quét thành công thì refresh ngay
  useEffect(() => {
    const eventSessionId = liveScanEvent?.metadata?.attendance_session_id;
    if (!eventSessionId || !activeSession?.id) return;

    if (eventSessionId === activeSession.id) {
      applyRealtimeScanEvent(liveScanEvent);
    }
  }, [liveScanEvent, activeSession?.id, applyRealtimeScanEvent]);

  // Cập nhật thanh tiến trình
  useEffect(() => {
    if (selectedDuration) {
      const progress = 1 - timeRemaining / (selectedDuration * 60);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [timeRemaining, selectedDuration]);

  const endSession = async () => {
    setSessionActive(false);
    setSessionEnded(true);

    if (activeSession?.id) {
      try {
        console.log('Closing session with ID:', activeSession.id);
        await dispatch(closeAttendanceSessionThunk(activeSession.id)).unwrap();
        console.log('Session closed successfully');

        // Cập nhật hasActiveSession = false khi đóng phiên
        dispatch(setScheduleHasActiveSession({
          classSessionId: schedule.id,
          hasActiveSession: false
        }));
      } catch (err) {
        console.log('Close session error:', err);
      }
    }

    // Đồng bộ lần cuối để hiển thị danh sách điểm danh đầy đủ
    syncAttendanceStats();
  };

  const handleManualStop = () => {
    Alert.alert(
      'Kết thúc phiên điểm danh?',
      'Bạn có chắc muốn kết thúc phiên điểm danh sớm? Mã QR sẽ bị vô hiệu và thời gian sẽ dừng lại.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Kết thúc', style: 'destructive', onPress: endSession },
      ]
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAttendanceRate = () => {
    if (totalStudents === 0) return 0;
    return Math.round((attendedStudents.length / totalStudents) * 100);
  };

  const isQuorumMet = () => {
    return attendedStudents.length >= (totalStudents * 2) / 3;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={sessionEnded ? ['#6b7280', '#9ca3af'] : ['#7c3aed', '#8b5cf6']}
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
          {!sessionEnded && (
            <TouchableOpacity onPress={() => setShowHistoryModal(true)}>
              <Ionicons name="time-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Session Info */}
        {(sessionActive || sessionEnded) && (
          <View className="px-6 pt-6">
            <View className="bg-white rounded-2xl p-4 mb-4" style={{ elevation: 3 }}>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-gray-900 text-lg font-bold">
                  Phiên điểm danh: {selectedDuration} phút
                </Text>
                <View className={`px-3 py-1 rounded-full flex-row items-center ${
                  sessionEnded ? 'bg-gray-100' : 'bg-green-100'
                }`}>
                  <View className={`w-2 h-2 rounded-full mr-2 ${
                    sessionEnded ? 'bg-gray-500' : 'bg-green-500'
                  }`} />
                  <Text className={`text-xs font-semibold ${
                    sessionEnded ? 'text-gray-700' : 'text-green-700'
                  }`}>
                    {sessionEnded ? 'Đã kết thúc' : 'Đang hoạt động'}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View className="h-2 bg-gray-200 rounded-full mb-2 overflow-hidden">
                <Animated.View
                  style={{
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                    height: '100%',
                    backgroundColor: '#7c3aed',
                  }}
                />
              </View>

              <Text className="text-gray-600 text-sm">
                Thời gian còn lại: {formatTime(timeRemaining)}
              </Text>
            </View>
          </View>
        )}

        {/* QR Code Display */}
        {currentQR?.qr_token && (
          <View className="px-6">
            <View className="bg-white rounded-3xl p-6 items-center mb-4" style={{ elevation: 5 }}>
              <Text className="text-gray-900 text-xl font-bold mb-2">
                {sessionEnded ? 'Mã QR không còn hiệu lực' : 'Mã QR điểm danh'}
              </Text>
              <Text className="text-gray-500 text-sm mb-4">
                {sessionEnded ? 'Phiên điểm danh đã kết thúc' : 'Sinh viên quét mã này để điểm danh'}
              </Text>

              <View style={{ position: 'relative' }}>
                <Animated.View
                  style={{
                    transform: [{ scale: qrScaleAnim }],
                    padding: 20,
                    backgroundColor: 'white',
                    borderRadius: 16,
                    opacity: sessionEnded ? 0.3 : 1,
                  }}
                >
                  <QRCode
                    value={JSON.stringify({
                      qr_token: currentQR.qr_token,
                      attendance_session_id: activeSession?.id,
                      qr_instance_id: currentQR.id,
                      course_section_id: schedule.courseSectionId,
                      status: sessionEnded ? 'invalid' : 'active',
                    })}
                    size={SCREEN_WIDTH * 0.6}
                    backgroundColor="white"
                    color="#7c3aed"
                  />
                </Animated.View>

                {/* Invalid Overlay */}
                {sessionEnded && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.9)',
                        paddingHorizontal: 20,
                        paddingVertical: 10,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
                        VÔ HIỆU
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {!sessionEnded && (
                <View className="mt-4 flex-row items-center">
                  <Ionicons name="timer-outline" size={16} color="#7c3aed" />
                  <Text className="text-purple-600 font-semibold ml-2">
                    QR mới trong {qrTimeRemaining}s
                  </Text>
                </View>
              )}

              <Text className={`text-xs mt-2 ${
                sessionEnded ? 'text-red-400' : 'text-gray-400'
              }`}>
                Token: {currentQR.qr_token?.substring(0, 8)}... {sessionEnded ? '(Không hợp lệ)' : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Attendance Statistics */}
        {(sessionActive || sessionEnded) && (
          <View className="px-6">
            <View className="bg-white rounded-2xl p-4 mb-4" style={{ elevation: 3 }}>
              <Text className="text-gray-900 text-lg font-bold mb-3">Thống kê điểm danh</Text>

              <View className="flex-row justify-between mb-4">
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-purple-600">
                    {attendedStudents.length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Đã điểm danh</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-gray-400">
                    {totalStudents - attendedStudents.length}
                  </Text>
                  <Text className="text-gray-500 text-xs">Chưa điểm danh</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="text-3xl font-bold text-blue-600">
                    {getAttendanceRate()}%
                  </Text>
                  <Text className="text-gray-500 text-xs">Tỷ lệ</Text>
                </View>
              </View>

              {/* Quorum Status */}
              <View
                className={`rounded-xl p-3 flex-row items-center ${
                  isQuorumMet() ? 'bg-green-50' : 'bg-orange-50'
                }`}
              >
                <Ionicons
                  name={isQuorumMet() ? 'checkmark-circle' : 'warning'}
                  size={20}
                  color={isQuorumMet() ? '#10b981' : '#f59e0b'}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    isQuorumMet() ? 'text-green-700' : 'text-orange-700'
                  }`}
                >
                  {isQuorumMet() ? 'Đạt yêu cầu quorum (≥2/3)' : 'Chưa đạt quorum (cần ≥2/3)'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Recently Attended List */}
        {(sessionActive || sessionEnded) && attendedStudents.length > 0 && (
          <View className="px-6">
            <Text className="text-gray-900 text-lg font-bold mb-3">
              {sessionEnded ? `Danh sách điểm danh (${attendedStudents.length})` : 'Điểm danh gần đây'}
            </Text>
            <View className="bg-white rounded-2xl p-4 mb-4" style={{ elevation: 3 }}>
              {(sessionEnded ? attendedStudents : attendedStudents.slice(-5)).reverse().map((student, index) => (
                <View
                  key={`${student.id}-${student.scanTime}-${index}`}
                  className={`flex-row items-center py-3 ${
                    index !== 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark" size={20} color="#10b981" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">
                      {student.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {student.studentId}
                    </Text>
                  </View>
                  <Text className="text-gray-400 text-xs">
                    {new Date(student.scanTime).toLocaleTimeString('vi-VN', {
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

        {/* Frequent Absentees Alert */}
        {frequentAbsentees.length > 0 && (
          <View className="px-6 pb-6">
            <Text className="text-gray-900 text-lg font-bold mb-3">Sinh viên hay nghỉ</Text>
            <View className="bg-orange-50 rounded-2xl p-4" style={{ elevation: 3 }}>
              {frequentAbsentees.map((student, index) => (
                <View
                  key={student.id}
                  className={`flex-row items-center py-3 ${
                    index !== 0 ? 'border-t border-orange-100' : ''
                  }`}
                >
                  <View className="w-10 h-10 bg-orange-200 rounded-full items-center justify-center mr-3">
                    <Ionicons name="alert-circle" size={20} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-semibold">
                      {student.name}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {student.studentId}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-orange-600 font-bold">
                      {student.absenceRate}%
                    </Text>
                    <Text className="text-orange-500 text-xs">Nghỉ</Text>
                  </View>
                  <View
                    className={`ml-3 w-3 h-3 rounded-full ${
                      attendedStudents.some((s) => s.studentId === student.studentId)
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Button */}
        <View className="px-6 pb-6">
          {sessionActive ? (
            <TouchableOpacity
              onPress={handleManualStop}
              className="bg-red-500 rounded-xl py-4 flex-row items-center justify-center"
              style={{ elevation: 3 }}
            >
              <Ionicons name="stop-circle-outline" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Kết thúc phiên điểm danh</Text>
            </TouchableOpacity>
          ) : sessionEnded ? (
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-purple-600 rounded-xl py-4 flex-row items-center justify-center"
              style={{ elevation: 3 }}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Quay lại danh sách phiên</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {/* Duration Selection Modal */}
      <Modal
        visible={showDurationModal}
        transparent
        animationType="fade"
        onRequestClose={() => navigation.goBack()}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-md">
            <Text className="text-gray-900 text-2xl font-bold mb-2 text-center">Chọn thời gian phiên</Text>
            <Text className="text-gray-500 text-sm mb-6 text-center">Thời gian tổng để sinh viên điểm danh</Text>

            {[2, 3, 5].map((duration) => (
              <TouchableOpacity
                key={duration}
                onPress={() => handleStartSession(duration)}
                className="bg-purple-50 rounded-xl p-4 mb-3 flex-row items-center justify-between"
                style={{ borderWidth: 2, borderColor: '#7c3aed' }}
              >
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-purple-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white text-xl font-bold">
                      {duration}
                    </Text>
                  </View>
                  <View>
                    <Text className="text-gray-900 font-bold text-lg">
                      {duration} phút
                    </Text>
                    <Text className="text-gray-500 text-xs">QR mới mỗi 10 giây</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#7c3aed" />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-gray-100 rounded-xl py-3 mt-2"
            >
              <Text className="text-gray-700 font-semibold text-center">Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* History Modal */}
      <QRHistoryModal
        visible={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        qrHistory={qrHistory.map(s => ({
          id: s.id,
          date: s.class_date,
          time: s.start_hour,
          createdBy: s.creator_name,
          duration: s.session_duration_minutes,
          attendanceCount: s.stats?.attended || 0,
          totalStudents: s.stats?.total || 0,
        }))}
      />
    </SafeAreaView>
  );
};

export default CreateQRSessionScreen;
