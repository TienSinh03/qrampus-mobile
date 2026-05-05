import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';

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
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const result = await dispatch(getStudentProfileThunk()).unwrap();
        if (result?.avatar_url) {
          navigateToHome();
        }
      } catch (error) {
        Alert.alert('Lỗi', error || 'Không thể lấy thông tin sinh viên');
      } finally {
        setChecking(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (!checking && profile?.avatar_url) {
      navigateToHome();
    }
  }, [checking, profile?.avatar_url]);

  const navigateToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'StudentHome', params: { userRole: 'student' } }],
    });
  };

  const requestPermission = async (type) => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần cấp quyền camera để chụp ảnh.');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Quyền truy cập', 'Cần cấp quyền thư viện ảnh để chọn ảnh.');
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const ok = await requestPermission('camera');
    if (!ok) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePickFromLibrary = async () => {
    const ok = await requestPermission('library');
    if (!ok) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedImage) return;

    try {
      setUploading(true);
      await dispatch(uploadStudentAvatarThunk(selectedImage)).unwrap();
      await dispatch(getStudentProfileThunk()).unwrap();
      navigateToHome();
    } catch (error) {
      Alert.alert('Lỗi', error || 'Cập nhật ảnh đại diện thất bại');
    } finally {
      setUploading(false);
    }
  };

  if (checking || isLoading || uploading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center gap-3">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-sm text-gray-500 mt-2">
          {uploading ? 'Đang cập nhật ảnh sinh viên...' : 'Đang kiểm tra hồ sơ...'}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 px-5">

      {/* Header */}
      <View className="items-center pt-10 pb-7 gap-2">
        <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center mb-1">
          <Ionicons name="person-circle-outline" size={32} color="#2563eb" />
        </View>
        <Text className="text-[22px] font-extrabold text-slate-900">Ảnh đại diện</Text>
        <Text className="text-sm text-slate-500 text-center leading-relaxed">
          Tài khoản của bạn chưa có ảnh đại diện.{'\n'}
          Vui lòng cập nhật để tiếp tục sử dụng.
        </Text>
      </View>

      {/* Avatar preview */}
      <View className="items-center mb-8 relative">
        {selectedImage ? (
          <Image
            source={{ uri: selectedImage }}
            className="w-[140px] h-[140px] rounded-full border-[3px] border-blue-600"
          />
        ) : (
          <View className="w-[140px] h-[140px] rounded-full bg-slate-100 border-2 border-slate-200 border-dashed items-center justify-center">
            <Ionicons name="person" size={72} color="#cbd5e1" />
          </View>
        )}

        {selectedImage && (
          <TouchableOpacity
            className="absolute bottom-0 bg-white rounded-full"
            style={{ right: '28%' }}
            onPress={() => setSelectedImage(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle" size={28} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Action buttons */}
      <View className="bg-white rounded-2xl overflow-hidden shadow mb-6">
        <TouchableOpacity
          className="flex-row items-center px-4 py-4 gap-3"
          onPress={handleTakePhoto}
          activeOpacity={0.8}
        >
          <View className="w-11 h-11 rounded-xl bg-blue-50 items-center justify-center">
            <Ionicons name="camera" size={24} color="#2563eb" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-slate-900 mb-0.5">Chụp ảnh</Text>
            <Text className="text-xs text-slate-400">Dùng camera để chụp ảnh mới</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>

        <View className="h-px bg-slate-50 ml-[74px]" />

        <TouchableOpacity
          className="flex-row items-center px-4 py-4 gap-3"
          onPress={handlePickFromLibrary}
          activeOpacity={0.8}
        >
          <View className="w-11 h-11 rounded-xl bg-green-50 items-center justify-center">
            <Ionicons name="images" size={24} color="#16a34a" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-slate-900 mb-0.5">Chọn từ thư viện</Text>
            <Text className="text-xs text-slate-400">Chọn ảnh có sẵn trong thiết bị</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {/* Confirm button */}
      {selectedImage && (
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 bg-blue-600 rounded-2xl py-4 mb-4"
          onPress={handleConfirmUpload}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark-circle" size={20} color="white" />
          <Text className="text-white text-base font-bold">Xác nhận & Tiếp tục</Text>
        </TouchableOpacity>
      )}

      <Text className="text-[11px] text-slate-400 text-center px-3">
        Ảnh sẽ được dùng để xác thực điểm danh bằng khuôn mặt
      </Text>

    </SafeAreaView>
  );
};

export default StudentAvatarGateScreen;
