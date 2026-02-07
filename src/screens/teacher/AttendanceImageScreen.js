import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendanceImagesBySessionId } from '../../features/attendanceImage/attendanceImageThunks';

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 columns with padding

const AttendanceImageScreen = ({ navigation, route }) => {
  const { imageSession, schedule } = route.params;
  const dispatch = useDispatch();
  const { images, isLoading, error } = useSelector(state => state.attendanceImage);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Lấy session từ trang ImageSessionListScreen qua route.params
  // imageSession chứa: classDate, startHour, endHour, captureType, startedAt, endedAt, note
  console.log('[DEBUG] imageSession:', imageSession);

  useEffect(() => {
    if (imageSession?.id) {
      console.log('-----------------------Dispatching fetch for session ID:', imageSession.id);
      dispatch(fetchAttendanceImagesBySessionId(imageSession.id));
    }
  }, [imageSession?.id, dispatch]);

  // Check if current time is within allowed class session time
  const canAddImage = () => {
    if (!imageSession?.classDate || !imageSession?.startHour || !imageSession?.endHour) {
      console.log('[DEBUG] Missing data - classDate:', imageSession?.classDate, 'startHour:', imageSession?.startHour, 'endHour:', imageSession?.endHour);
      return false;
    }

    const now = new Date();
    const classDate = new Date(imageSession.classDate);
    
    // Check if today is the class date
    const isSameDate = 
      now.getDate() === classDate.getDate() &&
      now.getMonth() === classDate.getMonth() &&
      now.getFullYear() === classDate.getFullYear();

    if (!isSameDate) {
      console.log('[DEBUG] Not same date. Now:', now.toLocaleDateString(), 'ClassDate:', classDate.toLocaleDateString());
      return false;
    }

    // Parse start and end hours (format: "HH:mm" or just "HH")
    const startParts = imageSession.startHour.toString().split(':');
    const endParts = imageSession.endHour.toString().split(':');
    const startHour = parseInt(startParts[0]);
    const startMinute = parseInt(startParts[1] || 0);
    const endHour = parseInt(endParts[0]);
    const endMinute = parseInt(endParts[1] || 0);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    const isWithinTime = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    console.log('[DEBUG] Time check - Current:', now.getHours() + ':' + now.getMinutes(), 
                'Range:', imageSession.startHour, '-', imageSession.endHour, 
                'Result:', isWithinTime);

    return isWithinTime;
  };

  const handleAddImage = () => {
    if (!canAddImage()) {
      alert(
        'Chỉ có thể thêm ảnh trong giờ học\n' +
        'Ngày: ' + new Date(imageSession?.classDate).toLocaleDateString('vi-VN') + '\n' +
        'Từ ' + imageSession?.startHour + ' đến ' + imageSession?.endHour
      );
      return;
    }
    // Navigate đến AttendancePhotoScreen
    navigation.navigate('AttendancePhoto', {
      imageSession: imageSession,
      schedule: schedule,
    });
  };



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

  const handleImagePress = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  // console.log('session.classDate:', session?.classDate);


  const renderImageItem = (image, index) => {
    console.log('Rendering image:', index, image.fileUrl);
    return (
      <TouchableOpacity
        key={image.id || index}
        onPress={() => handleImagePress(image)}
        activeOpacity={0.7}
        className="mb-3"
        style={{ width: imageSize }}
      >
        <View className="rounded-xl overflow-hidden bg-gray-200" style={{ height: imageSize }}>
          <Image
            source={{ uri: image.thumbnailUrl || image.fileUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
            onLoad={() => console.log('Image loaded successfully:', image.fileUrl)}
          />
          
          {/* Student count badge */}
          {image.studentCountAi && (
            <View className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex-row items-center">
              <Ionicons name="people" size={12} color="white" />
              <Text className="text-white text-xs font-bold ml-1">
                {image.studentCountAi}
              </Text>
            </View>
          )}
        </View>
        
        <Text className="text-gray-500 text-xs mt-1 text-center">
          {formatDateTime(image.takenAt).split(',')[1]?.trim() || ''}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={['#7c3aed', '#8b5cf6']} className="px-6 py-4">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View className="flex-1">
            <Text className="text-white text-lg font-bold">
              Bộ sưu tập hình ảnh
            </Text>
            <Text className="text-white/80 text-sm">
              {schedule?.courseName || 'Tên môn học'}
            </Text>
          </View>

          <TouchableOpacity 
            className={`rounded-full p-2 ${canAddImage() ? 'bg-white/20' : 'bg-white/10'}`}
            onPress={handleAddImage}
            disabled={!canAddImage()}
          >
            <Ionicons name="add" size={24} color={canAddImage() ? "white" : "rgba(255,255,255,0.3)"} />
          </TouchableOpacity>
        </View>

        {/* Session Info */}
        <View className="bg-white/10 rounded-xl p-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name="camera" size={16} color="white" />
              <Text className="text-white/90 text-xs ml-2">
                {imageSession?.captureType === 'manual' ? 'Chụp thủ công' : 'Chụp tự động'}
              </Text>
            </View>
            
            <View
              className={`px-2 py-1 rounded-full ${
                imageSession?.endedAt ? 'bg-white/20' : 'bg-green-500/30'
              }`}
            >
              <Text className="text-white text-xs font-semibold">
                {imageSession?.endedAt ? 'Đã kết thúc' : 'Đang hoạt động'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color="white" />
            <Text className="text-white/90 text-xs ml-2">
              {formatDateTime(imageSession?.startedAt)}
            </Text>
          </View>

          {imageSession?.note && (
            <View className="mt-2 pt-2 border-t border-white/20">
              <Text className="text-white/90 text-xs">
                {imageSession.note}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView className="flex-1 px-4 pt-4">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-900 text-lg font-bold">
            Hình ảnh ({images.length})
          </Text>
          
          {images.length > 0 && (
            <TouchableOpacity className="flex-row items-center">
              <Ionicons name="grid-outline" size={20} color="#7c3aed" />
              <Text className="text-purple-600 text-sm font-semibold ml-1">
                Xem lưới
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Loading State */}
        {isLoading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#7c3aed" />
            <Text className="text-gray-500 text-sm mt-3">
              Đang tải hình ảnh...
            </Text>
          </View>
        )}

        {/* Empty State */}
        {!isLoading && images.length === 0 && (
          <View className="items-center justify-center py-20">
            <View className="bg-gray-100 rounded-full p-8 mb-4">
              <Ionicons name="images-outline" size={64} color="#9ca3af" />
            </View>
            <Text className="text-gray-900 font-bold text-lg mb-2">
              Chưa có hình ảnh
            </Text>
            <Text className="text-gray-500 text-sm text-center mb-6 px-8">
              Bộ sưu tập này chưa có hình ảnh nào. Nhấn nút + ở trên để thêm hình ảnh.
            </Text>
            <TouchableOpacity className="bg-purple-600 px-6 py-3 rounded-xl">
              <Text className="text-white font-semibold">Thêm hình ảnh</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Images Grid */}
        {!isLoading && images.length > 0 && (
          <View className="flex-row flex-wrap justify-between">
            {images.map((image, index) => renderImageItem(image, index))}
          </View>
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Full Screen Image Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-white/10 rounded-full p-2"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View className="flex-row space-x-3">
                <TouchableOpacity className="bg-white/10 rounded-full p-2">
                  <Ionicons name="share-outline" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-white/10 rounded-full p-2">
                  <Ionicons name="download-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1 items-center justify-center">
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage.fileUrl }}
                  style={{ width: width, height: width * 0.75 }}
                  resizeMode="contain"
                />
              )}
            </View>

            {selectedImage && (
              <View className="bg-black/50 px-6 py-4">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Ionicons name="time-outline" size={16} color="white" />
                    <Text className="text-white text-sm ml-2">
                      {formatDateTime(selectedImage.takenAt)}
                    </Text>
                  </View>
                  
                  {selectedImage.studentCountAi && (
                    <View className="flex-row items-center bg-white/10 rounded-full px-3 py-1">
                      <Ionicons name="people" size={16} color="white" />
                      <Text className="text-white text-sm font-semibold ml-1">
                        {selectedImage.studentCountAi} sinh viên
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AttendanceImageScreen;
