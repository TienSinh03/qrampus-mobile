import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
import { useDispatch, useSelector } from 'react-redux';
import CreateLeaveRequestModal from '../../components/modal/CreateLeaveRequestModal';
import ReasonPickerModal from '../../components/modal/ReasonPickerModal';
import { createLeaveRequestThunk, getLeaveRequestsOfStudentThunk } from '../../features/leave-request/leaveRequestThunk';
import { resetCreateState } from '../../features/leave-request/leaveRequestSlice';
import { getStudentSchedulesThunk } from '../../features/student/studentThunks';
import { selectStudentSchedules, selectSchedulesLoading } from '../../features/student/studentSlice';
import { reasonTypes } from '../../utils/reason.type';
import { DAYMAPPING } from '../../utils/day.mapping';
import { formatDate } from '../../utils/date.helper';

const LeaveRequestScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { createLoading, createError, createSuccess } = useSelector((state) => state.leaveRequests);
  const schedulesByDate = useSelector(selectStudentSchedules);
  const schedulesLoading = useSelector(selectSchedulesLoading);
  const { studentLeaves } = useSelector((state) => state.leaveRequests);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonType, setReasonType] = useState('sick'); // sick, family, school_activity, other
  const [note, setNote] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  
  useEffect(() => {
    fetchSchedules();
  }, []);

  // Fetch student's leave requests to check which schedules already have requests
  useEffect(() => {
    dispatch(getLeaveRequestsOfStudentThunk());
  }, [dispatch]);

  // Biến đổi lịch học và đánh dấu những lịch đã có yêu cầu nghỉ phép
  const schedules = useMemo(() => {
    if (!schedulesByDate || !Array.isArray(schedulesByDate)) return [];
    
    // Get set of sessionIds that already have leave requests
    const sessionsWithLeaveRequests = new Set(
      (studentLeaves || []).map(leave => leave.classSession?.id || leave.class_session_id)
    );

    return schedulesByDate.map(schedule => ({
      ...schedule,
      hasLeaveRequest: sessionsWithLeaveRequests.has(schedule.sessionId),
    }));
  }, [schedulesByDate, studentLeaves]);

  // Handle create success
  useEffect(() => {
    if (createSuccess) {
      Alert.alert(
        'Thành công',
        'Đơn xin nghỉ phép đã được gửi. Vui lòng chờ giảng viên phê duyệt.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowCreateModal(false);
              resetForm();
              dispatch(resetCreateState());
              navigation.navigate('LeaveRequestList');
            },
          },
        ]
      );
    }
  }, [createSuccess]);

  // Handle create error
  useEffect(() => {
    if (createError) {
      Alert.alert('Lỗi', createError);
      dispatch(resetCreateState());
    }
  }, [createError]);

  const fetchSchedules = async () => {
    // Fetch schedules for the next 2 weeks
    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);

    const startDate = today.toISOString().split('T')[0];
    const endDate = twoWeeksLater.toISOString().split('T')[0];

    dispatch(getStudentSchedulesThunk({ startDate, endDate }));
  };

  const handleCreateRequest = (schedule) => {
    setSelectedSchedule(schedule);
    setShowCreateModal(true);
  };
  
  // Hàm chọn ảnh từ thư viện
  const pickImage = async () => {
    if (attachments.length >= 3) {
      Alert.alert('Giới hạn', 'Chỉ được tải lên tối đa 3 tệp minh chứng');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập thư viện ảnh');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Check file size (max 5MB)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('Lỗi', 'Kích thước tệp không được vượt quá 5MB');
        return;
      }

      setAttachments([...attachments, {
        uri: asset.uri,
        type: asset.type || 'image',
        name: asset.fileName || `attachment_${Date.now()}.jpg`,
        size: asset.fileSize,
      }]);
    }
  };

  // Hàm chụp ảnh bằng camera
  const takePhoto = async () => {
    if (attachments.length >= 3) {
      Alert.alert('Giới hạn', 'Chỉ được tải lên tối đa 3 tệp minh chứng');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Lỗi', 'Cần cấp quyền truy cập camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setAttachments([...attachments, {
        uri: asset.uri,
        type: 'image',
        name: `photo_${Date.now()}.jpg`,
        size: asset.fileSize,
      }]);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedSchedule) {
      Alert.alert('Lỗi', 'Vui lòng chọn buổi học');
      return;
    }
    if (!reasonType) {
      Alert.alert('Lỗi', 'Vui lòng chọn lý do nghỉ');
      return;
    }
    if (attachments.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng đính kèm ít nhất 1 minh chứng');
      return;
    }
    if (note.trim().length < 10) {
      Alert.alert('Lỗi', 'Ghi chú phải có ít nhất 10 ký tự');
      return;
    }
    if (note.length > 500) {
      Alert.alert('Lỗi', 'Ghi chú không được vượt quá 500 ký tự');
      return;
    }

    // Get device info
    // const deviceId = await Device.osInternalBuildId;
    // const deviceName = Device.modelName;

    // Build FormData for API
    const formData = new FormData();
    formData.append('class_session_id', selectedSchedule.sessionId);
    formData.append('reason_type', reasonType);
    formData.append('note', note.trim());

    // Add attachments
    attachments.forEach((attachment, index) => {
      formData.append('attachments', {
        uri: attachment.uri,
        type: attachment.type === 'image' ? 'image/jpeg' : 'application/pdf',
        name: attachment.name || `attachment_${index}.jpg`,
      });
    });

    // Dispatch create leave request
    dispatch(createLeaveRequestThunk(formData));
  };

  const resetForm = () => {
    setSelectedSchedule(null);
    setReasonType('sick');
    setNote('');
    setAttachments([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'ongoing':
        return 'bg-blue-100 text-blue-700';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'ongoing':
        return 'Đang diễn ra';
      case 'scheduled':
        return 'Sắp diễn ra';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Chưa xác định';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Xin nghỉ phép</Text>
          <TouchableOpacity onPress={() => navigation.navigate('LeaveRequestList')}>
            <Ionicons name="list" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-white/80 text-sm">Chọn buổi học để nộp đơn xin nghỉ phép</Text>
      </LinearGradient>

      {/* Schedule List */}
      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {schedulesLoading ? (
          <View className="flex-1 items-center justify-center py-10">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-500 mt-2">Đang tải lịch học...</Text>
          </View>
        ) : schedules.length === 0 ? (
          <View className="flex-1 items-center justify-center py-10">
            <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
            <Text className="text-gray-500 mt-2">Không có lịch học trong 2 tuần tới</Text>
          </View>
        ) : (
          schedules.map((schedule) => (
            <View
              key={schedule.sessionId || schedule.id}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {/* Schedule Info */}
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-gray-900 font-bold text-base flex-1 mr-2" numberOfLines={1}>
                  {schedule.courseName || 'Unknown Course'}
                </Text>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(schedule.sessionStatus)}`}>
                  <Text className="text-xs font-semibold">
                    {getStatusText(schedule.sessionStatus)}
                  </Text>
                </View>
              </View>

              <Text className="text-gray-600 text-sm mb-2">
                {schedule.courseCode || 'N/A'} • {schedule.room || 'N/A'}
              </Text>

              <View className="flex-row items-center mb-3">
                <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1">
                  {schedule.dayOfWeek || (schedule.classDate && DAYMAPPING[new Date(schedule.classDate).getDay()] || 'N/A')}, {formatDate(schedule.classDate)}
                </Text>
                <Ionicons name="time-outline" size={14} color="#6b7280" style={{ marginLeft: 12 }} />
                <Text className="text-gray-600 text-sm ml-1">
                  {schedule.startHour || 'N/A'} - {schedule.endHour || 'N/A'}
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Ionicons name="person-outline" size={14} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-1">{schedule.teacherName || 'N/A'}</Text>
              </View>

              {/* Action Button */}
              {schedule.hasLeaveRequest ? (
                <View className="bg-gray-100 rounded-xl py-3 flex-row items-center justify-center">
                  <Ionicons name="checkmark-circle" size={18} color="#6b7280" />
                  <Text className="text-gray-600 text-sm ml-2">Đã nộp đơn</Text>
                </View>
              ) : schedule.sessionStatus !== 'scheduled' ? (
                <View className="bg-gray-100 rounded-xl py-3 flex-row items-center justify-center">
                  <Ionicons name="lock-closed" size={18} color="#9ca3af" />
                  <Text className="text-gray-400 text-sm ml-2">
                    {schedule.sessionStatus === 'completed' 
                      ? 'Buổi học đã kết thúc'
                      : schedule.sessionStatus === 'ongoing'
                      ? 'Buổi học đang diễn ra'
                      : schedule.sessionStatus === 'cancelled'
                      ? 'Buổi học đã hủy'
                      : 'Không thể nộp đơn'}
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => handleCreateRequest(schedule)}
                  className="bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
                >
                  <Ionicons name="document-text" size={18} color="white" />
                  <Text className="text-white font-bold text-sm ml-2">Nộp đơn xin nghỉ</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
        <View className="h-4" />
      </ScrollView>

      {/* Create Request Modal */}
      <CreateLeaveRequestModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        selectedSchedule={selectedSchedule}
        reasonType={reasonType}
        reasonTypes={reasonTypes}
        setShowReasonPicker={setShowReasonPicker}
        note={note}
        setNote={setNote}
        attachments={attachments}
        removeAttachment={removeAttachment}
        takePhoto={takePhoto}
        pickImage={pickImage}
        handleSubmit={handleSubmit}
        createLoading={createLoading}
      />

      {/* Reason Picker Modal */}
      <ReasonPickerModal
        visible={showReasonPicker}
        onClose={() => setShowReasonPicker(false)}
        reasonTypes={reasonTypes}
        reasonType={reasonType}
        setReasonType={setReasonType}
      />
    </SafeAreaView>
  );
};

export default LeaveRequestScreen;
