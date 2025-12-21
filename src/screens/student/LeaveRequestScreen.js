import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Device from 'expo-device';
import CreateLeaveRequestModal from '../../components/modal/CreateLeaveRequestModal';
import ReasonPickerModal from '../../components/modal/ReasonPickerModal';

const LeaveRequestScreen = ({ navigation }) => {
  const [schedules, setSchedules] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonType, setReasonType] = useState('sick'); // sick, family, school_activity, other
  const [note, setNote] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showReasonPicker, setShowReasonPicker] = useState(false);

  const reasonTypes = [
    { value: 'sick', label: 'Bệnh', icon: 'medkit' },
    { value: 'family', label: 'Việc gia đình', icon: 'home' },
    { value: 'school_activity', label: 'Hoạt động trường', icon: 'school' },
    { value: 'other', label: 'Khác', icon: 'ellipsis-horizontal' },
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    // Call API to get student's schedules

    const mockSchedules = [
      {
        id: 1,
        courseName: 'Lập trình Di động',
        courseCode: 'IT4788',
        date: '2025-12-08',
        dayOfWeek: 'Thứ 2',
        startTime: '07:00',
        endTime: '09:00',
        room: 'D3-201',
        teacherName: 'TS. Nguyễn Văn A',
        attendanceStatus: 'absent', // present, absent, excused_absent, null (chưa điểm danh)
        hasLeaveRequest: false,
      },
      {
        id: 2,
        courseName: 'Cơ sở dữ liệu',
        courseCode: 'IT3090',
        date: '2025-12-09',
        dayOfWeek: 'Thứ 3',
        startTime: '13:00',
        endTime: '15:00',
        room: 'D5-302',
        teacherName: 'PGS. Trần Thị B',
        attendanceStatus: null,
        hasLeaveRequest: false,
      },
      {
        id: 3,
        courseName: 'Mạng máy tính',
        courseCode: 'IT4060',
        date: '2025-12-10',
        dayOfWeek: 'Thứ 4',
        startTime: '09:15',
        endTime: '11:15',
        room: 'TC-209',
        teacherName: 'TS. Lê Văn C',
        attendanceStatus: 'absent',
        hasLeaveRequest: true,
      },
    ];

    setSchedules(mockSchedules);
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
    const deviceId = await Device.osInternalBuildId;
    const deviceName = Device.modelName;

    // Check device ID against registered devices
    // If device is not recognized, require OTP verification

    // Call API to create leave request

    Alert.alert(
      'Thành công',
      'Đơn xin nghỉ phép đã được gửi. Vui lòng chờ giảng viên phê duyệt.',
      [
        {
          text: 'OK',
          onPress: () => {
            setShowCreateModal(false);
            resetForm();
            navigation.navigate('LeaveRequestList');
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedSchedule(null);
    setReasonType('sick');
    setNote('');
    setAttachments([]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700';
      case 'absent':
        return 'bg-red-100 text-red-700';
      case 'excused_absent':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present':
        return 'Có mặt';
      case 'absent':
        return 'Vắng';
      case 'excused_absent':
        return 'Vắng có phép';
      default:
        return 'Chưa điểm danh';
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
        {schedules.map((schedule) => (
          <View
            key={schedule.id}
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
              <Text className="text-gray-900 font-bold text-base">
                {schedule.courseName}
              </Text>
              <View className={`px-3 py-1 rounded-full ${getStatusColor(schedule.attendanceStatus)}`}>
                <Text className="text-xs font-semibold">
                  {getStatusText(schedule.attendanceStatus)}
                </Text>
              </View>
            </View>

            <Text className="text-gray-600 text-sm mb-2">
              {schedule.courseCode} • {schedule.room}
            </Text>

            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar-outline" size={14} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1">
                {schedule.dayOfWeek}, {schedule.date}
              </Text>
              <Ionicons name="time-outline" size={14} color="#6b7280" className="ml-3" />
              <Text className="text-gray-600 text-sm ml-1">
                {schedule.startTime} - {schedule.endTime}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name="person-outline" size={14} color="#6b7280" />
              <Text className="text-gray-600 text-sm ml-1">{schedule.teacherName}</Text>
            </View>

            {/* Action Button */}
            {schedule.hasLeaveRequest ? (
              <View className="bg-gray-100 rounded-xl py-3 flex-row items-center justify-center">
                <Ionicons name="checkmark-circle" size={18} color="#6b7280" />
                <Text className="text-gray-600 text-sm ml-2">Đã nộp đơn</Text>
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
        ))}
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
