import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import {
  uploadAttendanceImage,
  fetchAttendanceImageById,
} from '../../features/attendanceImage/attendanceImageThunks';
import { clearUploadedImageId } from '../../features/attendanceImage/attendanceImageSlice';

const { width, height } = Dimensions.get('window');

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 15; // 15 × 2s = 30s timeout

const AttendancePhotoScreen = ({ navigation, route }) => {
  const { imageSession, schedule } = route.params || {};
  const dispatch = useDispatch();
  const { uploading, uploadedImageId, images } = useSelector(
    (state) => state.attendanceImage
  );

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [capturedImage, setCapturedImage] = useState(null);

  // AI polling states
  const [aiProcessing, setAiProcessing] = useState(false);
  const [aiCount, setAiCount] = useState(null);
  const [aiTimeout, setAiTimeout] = useState(false);

  const cameraRef = useRef(null);
  const pollTimerRef = useRef(null);
  const pollAttemptsRef = useRef(0);

  // Xóa polling timer khi unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      dispatch(clearUploadedImageId());
    };
  }, [dispatch]);

  // Bắt đầu polling ngay khi uploadedImageId có giá trị
  useEffect(() => {
    if (!uploadedImageId) return;

    setAiProcessing(true);
    setAiCount(null);
    setAiTimeout(false);
    pollAttemptsRef.current = 0;

    const poll = async () => {
      if (pollAttemptsRef.current >= POLL_MAX_ATTEMPTS) {
        setAiProcessing(false);
        setAiTimeout(true);
        return;
      }

      pollAttemptsRef.current += 1;

      const result = await dispatch(fetchAttendanceImageById(uploadedImageId));

      if (fetchAttendanceImageById.fulfilled.match(result)) {
        const count = result.payload?.studentCountAi;
        if (count != null) {
          setAiCount(count);
          setAiProcessing(false);
          dispatch(clearUploadedImageId());
          return;
        }
      }

      // Chưa có kết quả, poll tiếp
      pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    };

    pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);

    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [uploadedImageId, dispatch]);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
        skipProcessing: false,
      });
      setCapturedImage(photo.uri);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
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
    } catch {
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setAiCount(null);
    setAiTimeout(false);
    setAiProcessing(false);
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    dispatch(clearUploadedImageId());
  };

  const handleConfirm = async () => {
    if (!capturedImage || !imageSession?.id) return;
    const resultAction = await dispatch(
      uploadAttendanceImage({ imageSessionId: imageSession.id, imageUri: capturedImage })
    );
    if (uploadAttendanceImage.rejected.match(resultAction)) {
      Alert.alert('Lỗi', resultAction.payload || 'Không thể upload ảnh');
    }
    // Nếu fulfilled → polling tự khởi động qua useEffect uploadedImageId
  };

  const handleDone = useCallback(() => {
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    dispatch(clearUploadedImageId());
    navigation.goBack();
  }, [dispatch, navigation]);

  const toggleCameraFacing = () => {
    setFacing((cur) => (cur === 'back' ? 'front' : 'back'));
  };

  // Trạng thái sau khi upload thành công (đang poll hoặc đã có kết quả)
  const isUploaded = !uploading && capturedImage && (aiProcessing || aiCount != null || aiTimeout);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#0171a5" />
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
              className="bg-sky-600 px-6 py-3 rounded-xl"
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
                <View className="absolute -top-2 -left-2 w-6 h-6 border-l-4 border-t-4 border-sky-500 rounded-tl-xl" />
                <View className="absolute -top-2 -right-2 w-6 h-6 border-r-4 border-t-4 border-sky-500 rounded-tr-xl" />
                <View className="absolute -bottom-2 -left-2 w-6 h-6 border-l-4 border-b-4 border-sky-500 rounded-bl-xl" />
                <View className="absolute -bottom-2 -right-2 w-6 h-6 border-r-4 border-b-4 border-sky-500 rounded-br-xl" />

                <View
                  className="absolute top-1/2 left-1/2 bg-black/50 px-4 py-2 rounded-full"
                  style={{ marginLeft: -80, marginTop: -20 }}
                >
                  <Text className="text-white text-sm text-center">Đưa camera về phía lớp học</Text>
                </View>
              </View>
            </View>
          </CameraView>
        ) : (
            
          // Image preview with processing and result
          <View className="flex-1 bg-black">
            {/* Ảnh đã chụp — thu nhỏ lại khi có AI overlay để không bị che */}
            <Image
              source={{ uri: capturedImage }}
              style={{
                width,
                height: isUploaded ? height * 0.52 : height * 0.75,
              }}
              resizeMode="contain"
            />

            {/* AI Result Card — hiện rõ bên dưới ảnh */}
            {isUploaded && (
              <View className="flex-1 justify-center px-5">
                {aiProcessing ? (
                  /*  Đang phân tích  */
                  <View
                    className="rounded-3xl px-6 py-6 items-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
                  >
                    {/* Animated spinner ring */}
                    <View className="w-20 h-20 rounded-full bg-sky-500/20 items-center justify-center mb-4">
                      <ActivityIndicator size="large" color="#38bdf8" />
                    </View>
                    <Text className="text-white font-black text-lg text-center">
                      Mô hình đang phân tích ảnh
                    </Text>
                    <Text className="text-white/50 text-sm text-center mt-2">
                      Đang đếm số lượng sinh viên trong lớp...
                    </Text>
                    {/* Progress dots */}
                    <View className="flex-row gap-2 mt-5">
                      {[0, 1, 2].map((i) => (
                        <View key={i} className="w-2 h-2 rounded-full bg-sky-400/60" />
                      ))}
                    </View>
                  </View>
                ) : aiCount != null ? (
                  /*  Có kết quả  */
                  <View
                    className="rounded-3xl px-6 py-6 items-center"
                    style={{ backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1.5, borderColor: 'rgba(16,185,129,0.4)' }}
                  >
                    {/* Check icon */}
                    <View className="w-16 h-16 rounded-full bg-emerald-500 items-center justify-center mb-3">
                      <Ionicons name="checkmark" size={36} color="white" />
                    </View>
                    <Text className="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-3">
                      Phân tích hoàn tất
                    </Text>
                    {/* Count */}
                    <View className="flex-row items-end gap-2">
                      <Text className="text-white font-black" style={{ fontSize: 64, lineHeight: 68 }}>
                        {aiCount}
                      </Text>
                      <Text className="text-white/60 text-lg font-semibold mb-3">
                        sinh viên
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-2 mt-1">
                      <Ionicons name="people" size={16} color="rgba(255,255,255,0.4)" />
                      <Text className="text-white/40 text-xs">
                        được phát hiện bởi AI
                      </Text>
                    </View>
                  </View>
                ) : (
                  /*  Timeout  */
                  <View
                    className="rounded-3xl px-6 py-6 items-center"
                    style={{ backgroundColor: 'rgba(245,158,11,0.1)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' }}
                  >
                    <View className="w-16 h-16 rounded-full bg-amber-500/20 items-center justify-center mb-3">
                      <Ionicons name="time" size={36} color="#f59e0b" />
                    </View>
                    <Text className="text-amber-400 font-bold text-base text-center">
                      AI chưa xử lý xong
                    </Text>
                    <Text className="text-white/50 text-sm text-center mt-2 leading-5">
                      Kết quả sẽ tự cập nhật khi bạn{'\n'}quay lại xem danh sách ảnh.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom Controls */}
      <View className="px-6 py-6 bg-black/80">
        {!capturedImage ? (
          /*  Chưa chụp: camera controls  */
          <View className="flex-row items-center justify-between">
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
              <View className="w-16 h-16 bg-white rounded-full border-4 border-sky-500" />
            </TouchableOpacity>

            {/* Flip camera button */}
            <TouchableOpacity
              onPress={toggleCameraFacing}
              className="w-14 h-14 bg-white/20 rounded-full items-center justify-center"
            >
              <Ionicons name="camera-reverse" size={28} color="white" />
            </TouchableOpacity>
          </View>
        ) : isUploaded ? (
          /*  Đã upload: chờ AI hoặc đã có kết quả  */
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
              onPress={handleDone}
              disabled={aiProcessing}
              className={`flex-1 py-4 rounded-xl flex-row items-center justify-center ${
                aiProcessing ? 'bg-sky-800' : 'bg-sky-600'
              }`}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                {aiProcessing ? 'Đang xử lý...' : 'Xong'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /*  Đã chụp, chưa upload  */
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
              className="flex-1 bg-sky-600 py-4 rounded-xl flex-row items-center justify-center"
            >
              {uploading ? (
                <>
                  <ActivityIndicator size="small" color="white" />
                  <Text className="text-white font-semibold ml-2">Đang lưu...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="cloud-upload" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Lưu ảnh</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info banner (chỉ hiện khi chưa chụp) */}
      {!capturedImage && (
        <View className="absolute bottom-32 left-4 right-4 bg-sky-900/90 rounded-xl p-4">
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
