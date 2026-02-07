import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { uploadAttendanceImage } from '../../features/attendanceImage/attendanceImageThunks';

const { width, height } = Dimensions.get('window');

const AttendancePhotoScreen = ({ navigation, route }) => {
  const { imageSession, schedule } = route.params || {};
  const dispatch = useDispatch();
  const { uploading } = useSelector(state => state.attendanceImage);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    console.log('[DEBUG] AttendancePhotoScreen imageSession:', imageSession);
    console.log('[DEBUG] AttendancePhotoScreen schedule:', schedule);
  }, [imageSession, schedule]);
  

  // Chụp ảnh bằng camera
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
          exif: false,
          skipProcessing: false, // Xử lý ảnh để giữ aspect ratio đúng
        });
        setCapturedImage(photo.uri);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
      }
    }
  };

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };



  // Xử lý chụp lại ảnh
  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = async () => {
    if (!capturedImage || !imageSession?.id) {
      return;
    }

    try {
      console.log('[DEBUG] Uploading image:', capturedImage);
      console.log('[DEBUG] Image session ID:', imageSession.id);
      
      const resultAction = await dispatch(
        uploadAttendanceImage({
          imageSessionId: imageSession.id,
          imageUri: capturedImage,
        })
      );

      if (uploadAttendanceImage.fulfilled.match(resultAction)) {
        // Quay lại màn hình trước, sẽ tự động reload
        navigation.goBack();
      }
    } catch (error) {
      console.error('[ERROR] Upload failed:', error);
    }
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text className="text-gray-600 mt-4">Đang yêu cầu quyền truy cập camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="camera-off" size={48} color="#ef4444" />
          </View>
          <Text className="text-gray-900 font-bold text-xl mb-2 text-center">Không có quyền truy cập camera</Text>
          <Text className="text-gray-600 text-center mb-6">Vui lòng cấp quyền truy cập camera để sử dụng tính năng này.</Text>
          <View className="flex-row" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={requestPermission}
              className="bg-purple-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-bold">Cấp quyền</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-gray-300 px-6 py-3 rounded-xl"
            >
              <Text className="text-gray-700 font-bold">Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 py-4 bg-black/50 absolute top-7 left-0 right-0 z-10">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          
          <View className="flex-1 mx-4">
            <Text className="text-white font-bold text-base text-center">Chụp ảnh điểm danh</Text>
            {schedule && (
              <Text className="text-white/70 text-xs text-center mt-1">
                {schedule.courseCode} - {schedule.courseName}
              </Text>
            )}
          </View>

          <View className="w-10" />
        </View>
      </View>

      {/* Camera or Image Preview */}
      <View className="flex-1">
        {!capturedImage ? (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            mode="picture" // ensure picture mode
          >
            {/* Guide overlay */}
            <View className="flex-1 items-center justify-center">
              <View 
                className="border-2 border-white/50 rounded-2xl"
                style={{
                  width: width * 0.85,
                  height: height * 0.5,
                }}
              >
                <View className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-purple-500 rounded-tl-xl" />
                <View className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-purple-500 rounded-tr-xl" />
                <View className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-purple-500 rounded-bl-xl" />
                <View className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-purple-500 rounded-br-xl" />
                
                <View className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 px-4 py-2 rounded-full"
                  style={{ marginLeft: -80, marginTop: -20 }}
                >
                  <Text className="text-white text-sm text-center">Đưa camera về phía lớp học</Text>
                </View>
              </View>
            </View>
          </CameraView>
        ) : (
            
          // Image preview with processing and result
          <View className="flex-1 bg-black items-center justify-center">
            <Image
              source={{ uri: capturedImage }}
              style={{ width: width, height: height * 0.75 }}
              resizeMode="contain"
            />
            

          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View className="px-6 py-6 bg-black/80">
        {!capturedImage ? (
          <View className="flex-row items-center justify-between">
            {/* Gallery button */}
            <TouchableOpacity
              onPress={pickImage}
              className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="images" size={28} color="white" />
            </TouchableOpacity>

            {/* Capture button */}
            <TouchableOpacity
              onPress={takePicture}
              className="w-20 h-20 bg-white rounded-full items-center justify-center"
              style={{
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 10,
              }}
            >
              <View className="w-16 h-16 bg-white rounded-full border-4 border-purple-500" />
            </TouchableOpacity>

            {/* Flip camera button */}
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center" style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={handleRetake}
                disabled={uploading}
                className="flex-1 bg-gray-700 py-4 rounded-xl flex-row items-center justify-center"
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Chụp lại</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={uploading}
                className="flex-1 bg-purple-600 py-4 rounded-xl flex-row items-center justify-center"
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2">Lưu ảnh</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Info banner */}
      {!capturedImage && (
        <View className="absolute bottom-32 left-4 right-4 bg-purple-900/90 rounded-xl p-4">
          <View className="flex-row items-start">
            <Ionicons name="information-circle" size={24} color="#c4b5fd" />
            <View className="flex-1 ml-3">
              <Text className="text-white font-bold text-sm mb-1">Hướng dẫn chụp ảnh</Text>
              <Text className="text-white/80 text-xs leading-5">
                • Đưa camera về phía lớp học{'\n'}
                • Đảm bảo đủ ánh sáng và rõ nét{'\n'}
                • Hệ thống sẽ tự động phân tích sau khi lưu
              </Text>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default AttendancePhotoScreen;
