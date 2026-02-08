import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchImageSessionsByTeacher,
  checkImageSessionStatus 
} from '../../features/imageSession/imageSessionThunks';
import ImageSessionDetailModal from '../../components/modal/ImageSessionDetailModal';

const ImageSessionListScreen = ({ navigation, route }) => {
  const { schedule } = route.params;
  const dispatch = useDispatch();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [modalMode, setModalMode] = useState('view'); // 'view' or 'create'
  const [refreshing, setRefreshing] = useState(false);

  console.log('ImageSessionListScreen schedule:', schedule);

  const { sessions, isLoading, error, pagination, sessionStatus, checkLoading } = useSelector(
    (state) => state.imageSession
  );

  useEffect(() => {
    // Lấy danh sách image sessions dựa vào classSessionId
    if (schedule?.id) {
      dispatch(
        fetchImageSessionsByTeacher({
          courseSectionId: schedule.courseSectionId,
          page: 1,
          limit: 20,
        })
      );
      
      // Kiểm tra trạng thái active session
      dispatch(checkImageSessionStatus(schedule.id));
      console.log('-------------Dispatched checkImageSessionStatus for classSessionId:', schedule.id);
    }
  }, [dispatch, schedule?.id]);
  
  // console.log('Current sessionStatus from store:', sessionStatus.message);
  const hasCreatedSession = sessions.length > 0;
  
  // Sử dụng sessionStatus từ checkImageSessionStatus API
  const activeSession = sessionStatus;

  const handleSessionAction = () => {
    if (sessionStatus?.status === 'CREATED') {
      // View existing session
      setSelectedSession(sessionStatus);
      setModalMode('view');
      setModalVisible(true);
    } else {
      // Create new session
      setModalMode('create');
      setModalVisible(true);
    }
  };

  const handleViewSession = (session) => {
    navigation.navigate('AttendanceImage', {
      imageSession: session,
      schedule: schedule,
    });
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedSession(null);
    // Refresh data after modal closes
    if (schedule?.id) {
      dispatch(checkImageSessionStatus(schedule.id));
      dispatch(
        fetchImageSessionsByTeacher({
          courseSectionId: schedule.courseSectionId,
          page: 1,
          limit: 20,
        })
      );
    }
  };

  // Format thời gian
  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  // kiểm tra trạng thái phiên chụp ảnh dựa trên thời gian hiện tại
  const getSessionTimeStatus = (classDate, endHour) => {
    const now = new Date();
    const endDateTime = new Date(`${classDate}T${endHour}`);
    return now <= endDateTime ? 'ACTIVE' : 'EXPIRED';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (schedule?.id) {
        await Promise.all([
          dispatch(checkImageSessionStatus(schedule.id)),
          dispatch(
            fetchImageSessionsByTeacher({
              courseSectionId: schedule.courseSectionId,
              page: 1,
              limit: 20,
            })
          ),
        ]);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        className="px-6 py-4"
      >
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-white text-lg font-bold">
              {schedule.courseName}
            </Text>
            <Text className="text-white/80 text-sm">
              {schedule.courseCode} • {schedule.roomName}
            </Text>
          </View>
        </View>

        {/* Image Session Status */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSessionAction}
          className="rounded-xl overflow-hidden"
        >
          <View className="bg-white p-4 flex-row items-center">
            <Ionicons
              name={
                activeSession?.status === 'CREATED'
                  ? 'images'
                  : 'add-circle-outline'
              }
              size={26}
              color={
                activeSession?.status === 'CREATED'
                  ? '#16a34a'
                  : '#f97316'
              }
            />

            <View className="ml-3 flex-1">
              <Text className="text-black font-semibold text-sm">
                {activeSession?.status === 'CREATED'
                  ? 'Bộ sưu tập ảnh đã được tạo'
                  : 'Chưa tạo bộ sưu tập ảnh'}
              </Text>

              <Text className="text-black/60 text-xs mt-1">
                {activeSession?.status === 'CREATED'
                  ? 'Nhấn để xem chi tiết'
                  : 'Nhấn để tạo bộ sưu tập ảnh'}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color="#94a3b8"
            />
          </View>
        </TouchableOpacity>

      </LinearGradient>

      {/* Image Session List */}
      <ScrollView 
        className="flex-1 px-6 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#7c3aed']}
            tintColor="#7c3aed"
          />
        }
      >
        <Text className="text-gray-900 text-lg font-bold mb-3">
          Bộ sưu tập hình ảnh điểm danh
        </Text>

        {/* Loading State */}
        {isLoading && (
          <View className="bg-white rounded-2xl p-8 items-center">
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text className="text-gray-500 text-sm mt-3">
              Đang tải dữ liệu...
            </Text>
          </View>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <View className="bg-red-50 rounded-2xl p-6 items-center">
            <Ionicons name="alert-circle" size={48} color="#ef4444" />
            <Text className="font-bold text-lg text-red-600 mt-2">
              Lỗi khi tải dữ liệu
            </Text>
            <Text className="text-red-500 text-sm text-center mt-1">
              {error}
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && !error && !hasCreatedSession && (
          <View className="bg-white rounded-2xl p-8 items-center">
            <Ionicons name="images-outline" size={64} color="#9ca3af" />
            <Text className="font-bold text-lg mt-3">
              Chưa có bộ sưu tập ảnh
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Chưa có image session nào được tạo
            </Text>
          </View>
        )}

        {/* Sessions List */}
        {!isLoading && !error && hasCreatedSession && (
          <>
            {sessions.map((session, index) => (
              <TouchableOpacity
                key={session.id || index}
                onPress={() => handleViewSession(session)}
                
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 mb-3"
              >
                <View className="flex-row justify-between mb-2">
                  <Text className="font-bold">
                    {session.captureType === 'manual'
                      ? 'Chụp thủ công'
                      : 'Chụp tự động'}
                  </Text>

                {(() => {
                  const timeStatus = getSessionTimeStatus(
                    session.classDate,
                    session.endHour
                  );

                  return (
                    <View className="flex-row items-center justify-between">
                      {/* Trạng thái */}
                      <View
                        className={`px-3 py-1 rounded-full ${
                          timeStatus === 'ACTIVE'
                            ? 'bg-green-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            timeStatus === 'ACTIVE'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }`}
                        >
                          {timeStatus === 'ACTIVE'
                            ? 'Đang bắt đầu'
                            : 'Đã hết hạn'}
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                </View>

                <Text className="text-gray-600 text-sm mb-1">
                  Bắt đầu: {formatDateTime(session.startedAt)}
                </Text>

                {session.endedAt && (
                  <Text className="text-gray-600 text-sm mb-2">
                    Kết thúc: {formatDateTime(session.endedAt)}
                  </Text>
                )}

                {session.note && (
                  <View className="bg-gray-50 rounded-lg p-3 mt-2">
                    <Text className="text-gray-700 text-sm">
                      {session.note}
                    </Text>
                  </View>
                )}

                {/* Hiển thị thông tin lớp học (nếu có) */}
                {session.courseName && (
                  <View className="bg-purple-50 rounded-lg p-3 mt-2">
                    <Text className="text-purple-700 text-xs font-semibold">
                      Lớp học: {session.courseName}
                    </Text>
                    <Text className="text-purple-600 text-xs">
                      Ngày: {session.classDate} • {session.startHour} - {session.endHour}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Pagination Info */}
            {pagination && pagination.totalPages > 1 && (
              <View className="bg-white rounded-2xl p-4 mb-3 items-center">
                <Text className="text-gray-600 text-sm">
                  Trang {pagination.page} / {pagination.totalPages} • Tổng:{' '}
                  {pagination.total} bộ sưu tập
                </Text>
              </View>
            )}
          </>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Image Session Detail/Create Modal */}
      <ImageSessionDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        session={selectedSession}
        classSessionId={schedule?.id}
        mode={modalMode}
      />
    </SafeAreaView>
  );
};

export default ImageSessionListScreen;
