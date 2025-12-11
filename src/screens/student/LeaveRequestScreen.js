import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
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
      <Modal
        visible={showCreateModal}
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar style="dark" />

          {/* Modal Header */}
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-900 text-xl font-bold">Đơn xin nghỉ phép</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
            {/* Selected Schedule Info */}
            {selectedSchedule && (
              <View className="bg-blue-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-900 font-bold mb-1">
                  {selectedSchedule.courseName}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {selectedSchedule.dayOfWeek}, {selectedSchedule.date} • {selectedSchedule.startTime} - {selectedSchedule.endTime}
                </Text>
              </View>
            )}

            {/* Reason Type */}
            <Text className="text-gray-900 font-bold mb-2">
              Lý do nghỉ <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowReasonPicker(true)}
              className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between mb-4"
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={reasonTypes.find(r => r.value === reasonType)?.icon}
                  size={20}
                  color="#2563eb"
                />
                <Text className="text-gray-900 ml-3">
                  {reasonTypes.find(r => r.value === reasonType)?.label}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>

            {/* Note */}
            <Text className="text-gray-900 font-bold mb-2">
              Ghi chú chi tiết <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Mô tả chi tiết lý do nghỉ (tối thiểu 10 ký tự, tối đa 500 ký tự)"
              multiline
              numberOfLines={4}
              maxLength={500}
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 mb-2"
              style={{ textAlignVertical: 'top' }}
            />
            <Text className="text-gray-500 text-xs text-right mb-4">
              {note.length}/500 ký tự
            </Text>

            {/* Attachments */}
            <Text className="text-gray-900 font-bold mb-2">
              Minh chứng <Text className="text-red-500">*</Text>
            </Text>
            <Text className="text-gray-500 text-sm mb-3">
              Tải lên ảnh giấy xin phép, giấy khám bệnh... (JPG, PNG, tối đa 5MB/tệp, tối đa 3 tệp)
            </Text>

            {/* Attachment List */}
            {attachments.map((attachment, index) => (
              <View
                key={index}
                className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between mb-2"
              >
                <Image
                  source={{ uri: attachment.uri }}
                  className="w-16 h-16 rounded-lg"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                    {attachment.name}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {attachment.size ? `${(attachment.size / 1024).toFixed(0)} KB` : 'N/A'}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeAttachment(index)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Upload Buttons */}
            {attachments.length < 3 && (
              <View className="flex-row gap-2 mb-6">
                <TouchableOpacity
                  onPress={takePhoto}
                  className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Chụp ảnh</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={pickImage}
                  className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
                >
                  <Ionicons name="images" size={20} color="white" />
                  <Text className="text-white font-bold ml-2">Thư viện</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {/* Submit Button */}
          <View className="px-6 py-4 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-blue-600 rounded-xl py-4 flex-row items-center justify-center"
              style={{
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.3,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="send" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">Gửi đơn</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Reason Picker Modal */}
      <Modal
        visible={showReasonPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReasonPicker(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowReasonPicker(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <View className="bg-white rounded-t-3xl p-6">
            <Text className="text-gray-900 text-lg font-bold mb-4">Chọn lý do nghỉ</Text>
            {reasonTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                onPress={() => {
                  setReasonType(type.value);
                  setShowReasonPicker(false);
                }}
                className={`flex-row items-center p-4 rounded-xl mb-2 ${
                  reasonType === type.value ? 'bg-blue-50' : 'bg-gray-50'
                }`}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={reasonType === type.value ? '#2563eb' : '#6b7280'}
                />
                <Text
                  className={`ml-3 text-base ${
                    reasonType === type.value ? 'text-blue-600 font-bold' : 'text-gray-900'
                  }`}
                >
                  {type.label}
                </Text>
                {reasonType === type.value && (
                  <Ionicons name="checkmark-circle" size={20} color="#2563eb" className="ml-auto" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

export default LeaveRequestScreen;
