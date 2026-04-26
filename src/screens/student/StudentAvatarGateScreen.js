import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import FaceCameraModal from '../../components/modal/FaceCameraModal';
import {
  getStudentProfileThunk,
  uploadStudentAvatarThunk,
} from '../../features/student/studentThunks';

import {
  selectStudentProfile,
  selectStudentLoading,
} from '../../features/student/studentSlice';

const StudentAvatarGateScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);
  const isLoading = useSelector(selectStudentLoading);

  const [checking, setChecking] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await dispatch(getStudentProfileThunk()).unwrap();

        if (result?.avatar_url) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'StudentHome', params: { userRole: 'student' } }],
          });
        }
      } catch (error) {
        Alert.alert('Lỗi', error || 'Không thể lấy thông tin sinh viên');
      } finally {
        setChecking(false);
      }
    };

    loadProfile();
  }, [dispatch, navigation]);

  useEffect(() => {
    if (!checking && profile?.avatar_url) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'StudentHome', params: { userRole: 'student' } }],
      });
    }
  }, [checking, profile?.avatar_url, navigation]);

  const handleAvatarCapture = async ({ photo }) => {
    if (!photo?.uri) return;

    try {
      setUploading(true);

      await dispatch(uploadStudentAvatarThunk(photo.uri)).unwrap();
      await dispatch(getStudentProfileThunk()).unwrap();

      navigation.reset({
        index: 0,
        routes: [{ name: 'StudentHome', params: { userRole: 'student' } }],
      });
    } catch (error) {
      Alert.alert('Lỗi', error || 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setUploading(false);
    }
  };

  if (checking || isLoading || uploading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-gray-600 text-center">
          {uploading ? 'Đang cập nhật ảnh sinh viên...' : 'Đang kiểm tra hồ sơ...'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <FaceCameraModal
        userRole="student"
        mode="avatar"
        autoOpen
        hideTrigger
        preventClose
        onCapture={handleAvatarCapture}
      />
    </SafeAreaView>
  );
};

export default StudentAvatarGateScreen;