import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { scanAttendanceByQRThunk } from '../../features/attendanceSession/attendanceSessionThunks';
import { setScheduleAttended, selectStudentProfile } from '../../features/student/studentSlice';
import { getDevicePayload } from '../../utils/device.helper';
import * as Location from 'expo-location';
import ArcFaceModal from '../../components/modal/ArcFaceModal';

const QRScanScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { scheduleId, courseName, courseCode, room } = route.params || {};
  const profile = useSelector(selectStudentProfile);

  const [hasPermission, setHasPermission] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flashOn, setFlashOn] = useState(false);
  const [arcFaceVisible, setArcFaceVisible] = useState(false);
  const [attendanceId, setAttendanceId] = useState(null);

  const prefetchedDeviceInfoRef = useRef(null);
  const prefetchedLocationRef = useRef(null);

  useEffect(() => {
    getCameraPermissions();

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setLocationPermission(granted);

      try {
        prefetchedDeviceInfoRef.current = await getDevicePayload();
      } catch (e) {
        console.warn('Device prefetch failed:', e?.message);
      }

      if (!granted) return;

      try {
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown?.coords) {
          prefetchedLocationRef.current = {
            latitude: lastKnown.coords.latitude,
            longitude: lastKnown.coords.longitude,
          };
        }

        const current = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });

        if (current?.coords) {
          prefetchedLocationRef.current = {
            latitude: current.coords.latitude,
            longitude: current.coords.longitude,
          };
        }
      } catch (e) {
        console.warn('Location prefetch failed:', e?.message);
      }
    })();
  }, []);

  // Yêu cầu quyền truy cập camera
  const getCameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  // Yêu cầu quyền truy cập vị trí
  // const getLocationPermission = async () => {
  //   try {
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     setLocationPermission(status === 'granted');

  //     if (status !== 'granted') {
  //       Alert.alert(
  //         'Cần quyền truy cập vị trí',
  //         'Vui lòng cấp quyền truy cập vị trí trong Cài đặt để sử dụng tính năng này.',
  //         [
  //           {
  //             text: 'Hủy', 
  //             onPress: () => navigation.goBack(),
  //             style: 'cancel'
  //           },
  //           {
  //             text: 'Cấp quyền',
  //             onPress: () => Location.requestForegroundPermissionsAsync()
  //           }
  //         ]
  //       )
  //     }     
  //   } catch (error) {
  //     console.error('Location permission error:', error);
  //   }
  // }

  // Xử lý khi quét mã QR
  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanned || isProcessing) return;
    const t0 = Date.now();

    setScanned(true);
    setIsProcessing(true);
    Vibration.vibrate(100); // Rung nhẹ khi quét

    try {
      // Parse QR data
      const qrData = JSON.parse(data);
      const { qr_token, attendance_session_id } = qrData;
      
      if (!qr_token || !attendance_session_id) {
        throw new Error('QR code không hợp lệ');
      }

      let latitude = null;
      let longitude = null;

      // if (locationPermission) {
      //   try {
      //     const location = await Location.getCurrentPositionAsync({
      //       accuracy: Location.Accuracy.High,
      //       timeout: 10000,
      //       maximumAge: 5000,
      //     });

      //     latitude = location.coords.latitude;
      //     longitude = location.coords.longitude;
      //   } catch (error) {
      //     console.warn('Không lấy được GPS:', error.message);
      //   }
      // } else {
      //   Alert.alert('Cần bật GPS', 'Bạn phải bật GPS để điểm danh');
      //   return;
      // }
      // // Lấy payload thiết bị để backend kiểm tra chống chia sẻ thiết bị
      // const deviceInfo = await getDevicePayload();

      const loc = prefetchedLocationRef.current || {};
      const deviceInfo = prefetchedDeviceInfoRef.current || null;

      // Gọi API điểm danh
      const result = await submitAttendance({
        qr_token,
        class_session_id: scheduleId,
        latitude: loc.latitude ?? null,
        longitude: loc.longitude ??  null,
        device_info: deviceInfo,
      });
      console.log('DEBUG scan total ms =', Date.now() - t0);

      dispatch(
        setScheduleAttended({
          classSessionId: scheduleId,
          attendedAt: result?.attendance?.scan_time,
        })
      );

      // xác thực khuôn mặt
      setAttendanceId(result?.attendance?.id || null);
      setIsProcessing(false);
      setArcFaceVisible(true);
    } catch (error) {      
      Alert.alert(
        ' Điểm danh thất bại',
        error?.message || error || 'Có lỗi xảy ra. Vui lòng thử lại.',
        [
          {
            text: 'Quét lại',
            onPress: () => {
              setScanned(false);
              setIsProcessing(false);
            },
          },
          {
            text: 'Hủy',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }
  };

  const submitAttendance = async (attendanceData) => {
    const result = await dispatch(scanAttendanceByQRThunk(attendanceData)).unwrap();
    return result;
  };

  const handleArcFaceClose = () => {
    setArcFaceVisible(false);
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-white mt-4">Đang kiểm tra quyền camera...</Text>
      </SafeAreaView>
    );
  }

  if (hasPermission === false) {
    return (
      <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center px-6">
        <Ionicons name="camera-off" size={64} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4 text-center">
          Không có quyền truy cập camera
        </Text>
        <Text className="text-gray-400 text-center mt-2">
          Vui lòng cấp quyền camera trong Cài đặt để quét mã QR
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
        >
          <Text className="text-white font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Camera View */}
      <CameraView
        className="flex-1"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        enableTorch={flashOn}
      >
        {/* Header */}
        <SafeAreaView edges={['top']}>
          <View className="px-4 py-3 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <View className="bg-black/50 px-4 py-2 rounded-full">
              <Text className="text-white font-semibold text-sm">
                {courseName || courseCode}
              </Text>
            </View>

            {/* Action On/Off flash */}
            <TouchableOpacity
              onPress={() => setFlashOn(!flashOn)}
              className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
            >
              <Ionicons 
                name={flashOn ? "flash" : "flash-off"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Scan Frame */}
        <View className="flex-1 items-center justify-center">
          <View className="relative">
            {/* QR Frame */}
            <View className="w-72 h-72 border-2 border-white rounded-2xl relative">
              {/* scan frame*/}
              <View className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-2xl" />
              <View className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-2xl" />
              <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-2xl" />
              <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-2xl" />

              {/* Scanning line animation - có thể thêm Animated sau */}
              {!scanned && !isProcessing && (
                <View className="absolute top-0 left-0 right-0 h-1 bg-blue-500 opacity-70" />
              )}
            </View>

            {/* Processing overlay */}
            {isProcessing && (
              <View className="absolute inset-0 rounded-2xl">
                <View className="absolute inset-0 bg-black/70" />

                <View className="absolute inset-0 items-center justify-center px-6">
                  <View className="w-full max-w-[240px] bg-slate-900/90 border border-blue-400/40 rounded-2xl px-5 py-6 items-center">
                    <ActivityIndicator size="large" color="#60a5fa" />

                    <Text className="text-white text-base font-bold mt-3 text-center">
                      Đang xử lý mã QR
                    </Text>

                    <Text className="text-slate-300 text-xs text-center mt-1 leading-5">
                      Vui lòng giữ yên điện thoại trong giây lát
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Instructions Text */}
          <View className="mt-8 px-8">
            <Text className="text-white text-center text-base font-semibold mb-2">
              {isProcessing 
                ? 'Đang xác thực mã QR...'
                : scanned 
                  ? 'Đã quét mã QR'
                  : 'Đưa mã QR vào khung hình'}
            </Text>
            {!isProcessing && !scanned && (
              <Text className="text-gray-400 text-center text-sm">
                Mã QR sẽ được tự động quét khi vào khung
              </Text>
            )}
          </View>
        </View>

        {/* Bottom Info */}
        <SafeAreaView edges={['bottom']}>
          <View className="px-6 pb-6">
            <View className="bg-black/70 rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <Ionicons name="book" size={16} color="#60a5fa" />
                <Text className="text-white font-semibold ml-2">
                  {courseName || 'Lớp học'}
                </Text>
              </View>
              
              {courseCode && (
                <View className="flex-row items-center mb-2">
                  <Ionicons name="code-outline" size={16} color="#60a5fa" />
                  <Text className="text-gray-300 text-sm ml-2">
                    Mã lớp: {courseCode}
                  </Text>
                </View>
              )}

              {room && (
                <View className="flex-row items-center">
                  <Ionicons name="location" size={16} color="#60a5fa" />
                  <Text className="text-gray-300 text-sm ml-2">
                    Phòng: {room}
                  </Text>
                </View>
              )}
            </View>

            {/* Manual input button (optional) */}
            <TouchableOpacity
              className="bg-blue-600 py-3 rounded-xl mt-3"
              onPress={() => {
                // Navigate to manual QR code input screen
              }}
            >
              <Text className="text-white text-center font-semibold">
                Nhập mã thủ công
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>

      {/* ArcFace xác thực khuôn mặt sau điểm danh */}
      <ArcFaceModal
        visible={arcFaceVisible}
        onClose={handleArcFaceClose}
        userRole="student"
        avatarUrl={profile?.avatar_url}
        attendanceId={attendanceId}
        courseName={courseName}
        courseCode={courseCode}
        room={room}
      />
    </View>
  );
};

export default QRScanScreen;
