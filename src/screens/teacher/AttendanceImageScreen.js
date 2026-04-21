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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAttendanceImagesBySessionId } from '../../features/attendanceImage/attendanceImageThunks';

const { width } = Dimensions.get('window');
const imageSizeGrid = (width - 48) / 3; // 3 cột
const imageSizeList = width - 48;       // full width cho list
const optimizeImageSvgUri = Image.resolveAssetSource(
  require('../../../assets/undraw_optimize-image_q59h.svg')
).uri;

const AttendanceImageScreen = ({ navigation, route }) => {
  const { imageSession, schedule } = route.params;
  const dispatch = useDispatch();
  const { images, isLoading, error } = useSelector((state) => state.attendanceImage);

  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' hoặc 'list'
  const [refreshing, setRefreshing] = useState(false);

  console.log('[DEBUG] imageSession:', imageSession);

  useEffect(() => {
    if (imageSession?.id) {
      console.log('========imageSession============:', imageSession);
      dispatch(fetchAttendanceImagesBySessionId(imageSession.id));
    }
  }, [imageSession?.id, dispatch]);

  // Kiểm tra có được phép thêm ảnh không
  const canAddImage = () => {
    if (!imageSession?.classDate || !imageSession?.startHour || !imageSession?.endHour) {
      return false;
    }

    const now = new Date();
    const classDate = new Date(imageSession.classDate);

    const isSameDate =
      now.getDate() === classDate.getDate() &&
      now.getMonth() === classDate.getMonth() &&
      now.getFullYear() === classDate.getFullYear();

    if (!isSameDate) return false;

    const startParts = imageSession.startHour.toString().split(':');
    const endParts = imageSession.endHour.toString().split(':');
    const startHour = parseInt(startParts[0]);
    const startMinute = parseInt(startParts[1] || 0);
    const endHour = parseInt(endParts[0]);
    const endMinute = parseInt(endParts[1] || 0);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  // Kiểm tra giới hạn 5 ảnh
  const canUploadMore = () => {
    return images.length < 5;
  };

  const handleAddImage = () => {
    if (!canAddImage()) {
      alert(
        'Chỉ có thể thêm ảnh trong giờ học\n' +
          'Ngày: ' +
          new Date(imageSession?.classDate).toLocaleDateString('vi-VN') +
          '\nTừ ' +
          imageSession?.startHour +
          ' đến ' +
          imageSession?.endHour
      );
      return;
    }

    if (!canUploadMore()) {
      alert('Mỗi phiên chỉ được tải lên tối đa 5 hình ảnh.');
      return;
    }

    navigation.navigate('AttendancePhoto', {
      imageSession,
      schedule,
    });
  };

  const handleEdit = (image) => {
    console.log('Nhấn SỬA ảnh có id:', image.id);
    // Sau này sẽ mở màn hình edit hoặc modal chỉnh sửa
  };

  const handleDelete = (image) => {
    console.log('Nhấn XÓA ảnh có id:', image.id);
    // Sau này sẽ gọi API xóa + cập nhật redux
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

  // Xác định trạng thái session dựa trên thời gian
  const getSessionStatus = () => {
    if (!imageSession) return 'unknown';
    
    const now = new Date();
    const startedAt = imageSession.startedAt ? new Date(imageSession.startedAt) : null;
    const endedAt = imageSession.endedAt ? new Date(imageSession.endedAt) : null;

    // Nếu có endedAt và đã qua thời điểm kết thúc
    if (endedAt && now > endedAt) {
      return 'ended';
    }

    // Nếu có startedAt và chưa đến thời điểm bắt đầu
    if (startedAt && now < startedAt) {
      return 'not_started';
    }

    // Nếu đã bắt đầu và chưa kết thúc (hoặc chưa có endedAt)
    if (startedAt && now >= startedAt && (!endedAt || now <= endedAt)) {
      return 'ongoing';
    }

    return 'unknown';
  };

  const sessionStatus = getSessionStatus();

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (imageSession?.id) {
        await dispatch(fetchAttendanceImagesBySessionId(imageSession.id));
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleImagePress = (image) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const renderImageGrid = (image, index) => (
    <View key={image.id || index} style={{ width: imageSizeGrid }} className="mb-4">
      <TouchableOpacity
        onPress={() => handleImagePress(image)}
        activeOpacity={0.75}
        className="rounded-xl overflow-hidden bg-gray-200 relative"
        style={{ height: imageSizeGrid }}
      >
        <Image
          source={{ uri: image.thumbnailUrl || image.fileUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />

        {/* Badge số sinh viên */}
        {image.studentCountAi && (
          <View className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex-row items-center">
            <Ionicons name="people" size={12} color="white" />
            <Text className="text-white text-xs font-bold ml-1">{image.studentCountAi}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Thời gian */}
      <Text className="text-gray-500 text-xs mt-1 text-center">
        {formatDateTime(image.takenAt).split(',')[1]?.trim() || ''}
      </Text>

      {/* Nút sửa - xóa */}
      <View className="flex-row justify-center mt-1 space-x-4">
        <TouchableOpacity onPress={() => handleEdit(image)} className="p-1">
          <Ionicons name="pencil" size={20} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(image)} className="p-1">
          <Ionicons name="trash" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderImageList = (image, index) => (
    <TouchableOpacity
      key={image.id || index}
      onPress={() => handleImagePress(image)}
      activeOpacity={0.7}
      className="flex-row bg-white rounded-xl shadow-sm mb-3 overflow-hidden"
    >
      <Image
        source={{ uri: image.thumbnailUrl || image.fileUrl }}
        style={{ width: 100, height: 100 }}
        resizeMode="cover"
      />

      <View className="flex-1 p-3 justify-between">
        <View>
          <Text className="text-gray-800 font-medium">
            Ảnh {index + 1} - {formatDateTime(image.takenAt)}
          </Text>
          {image.studentCountAi && (
            <View className="flex-row items-center mt-1">
              <Ionicons name="people" size={16} color="#4b5563" />
              <Text className="text-gray-600 ml-1">{image.studentCountAi} sinh viên</Text>
            </View>
          )}
        </View>

        <View className="flex-row justify-end space-x-4">
          <TouchableOpacity onPress={() => handleEdit(image)}>
            <Ionicons name="pencil" size={20} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(image)}>
            <Ionicons name="trash" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient colors={['#0171a5', '#38bdf8']} className="px-6 pt-5 pb-6 overflow-hidden">
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 110,
            height: 210,
            opacity: 0.48,
          }}
        >
          <SvgUri
            uri={optimizeImageSvgUri}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          />
        </View>

        {/* ===== HEADER ===== */}
        <View className="flex-row items-center justify-between mb-5">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3 bg-white/15 p-2 rounded-full"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-white text-lg font-bold">
                Bộ sưu tập hình ảnh
              </Text>
              <Text className="text-white/80 text-sm mt-0.5">
                {schedule?.courseName || 'Môn học'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAddImage}
            disabled={!canAddImage() || !canUploadMore()}
            className={`ml-3 p-3 rounded-full ${
              canAddImage() && canUploadMore()
                ? 'bg-white/25'
                : 'bg-white/10'
            }`}
          >
            <Ionicons
              name="add"
              size={26}
              color={
                canAddImage() && canUploadMore()
                  ? 'white'
                  : 'rgba(255,255,255,0.4)'
              }
            />
          </TouchableOpacity>
        </View>

        {/* ===== SESSION INFO CARD ===== */}
        <View className="bg-white/10 rounded-2xl p-4 border border-white/10 shadow-lg">
          {/* Header: Type & Status */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-lg">
              <Ionicons 
                name={imageSession?.captureType === 'manual' ? "hand-right-outline" : "flash-outline"} 
                size={14} 
                color="#fbbf24" 
              />
              <Text className="text-white/90 text-xs font-medium ml-2 uppercase tracking-wider">
                {imageSession?.captureType === 'manual' ? 'Thủ công' : 'Tự động'}
              </Text>
            </View>

            <View className={`px-3 py-1.5 rounded-lg flex-row items-center ${
              sessionStatus === 'ended' 
                ? 'bg-slate-500/20' 
                : sessionStatus === 'ongoing' 
                ? 'bg-emerald-500/20' 
                : 'bg-amber-500/20'
            }`}>
              {sessionStatus === 'ongoing' && (
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
              )}
              <Text className={`text-xs font-bold ${
                sessionStatus === 'ended' 
                  ? 'text-slate-300' 
                  : sessionStatus === 'ongoing' 
                  ? 'text-emerald-400' 
                  : 'text-amber-400'
              }`}>
                {sessionStatus === 'ended' 
                  ? 'ĐÃ KẾT THÚC' 
                  : sessionStatus === 'ongoing' 
                  ? 'ĐANG DIỄN RA' 
                  : 'CHƯA BẮT ĐẦU'}
              </Text>
            </View>
          </View>

          {/* Body: Timeline Section */}
          <View className="flex-row items-stretch">
            {/* Cột mốc thời gian (Vertical Line) */}
            <View className="items-center mr-3 w-4">
              <View className="w-2 h-2 rounded-full bg-blue-400 mt-1" />
              <View className="w-[1px] flex-1 bg-white/20 my-1" />
              <View className="w-2 h-2 rounded-full border border-white/40" />
            </View>

            <View className="flex-1 pb-2">
              <View className="mb-3">
                <Text className="text-white/40 text-[10px] uppercase font-bold tracking-tighter">Bắt đầu</Text>
                <Text className="text-white text-sm font-medium">
                  {formatDateTime(imageSession?.startedAt)}
                </Text>
              </View>
              <View>
                <Text className="text-white/40 text-[10px] uppercase font-bold tracking-tighter">Kết thúc</Text>
                <Text className="text-white/90 text-sm font-medium">
                  {imageSession?.endedAt ? formatDateTime(imageSession?.endedAt) : '---'}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer: Note */}
          {imageSession?.note && (
            <View className="mt-4 pt-3 border-t border-white/10 flex-row items-start">
              <Ionicons name="document-text-outline" size={14} color="rgba(255,255,255,0.4)" />
              <Text className="text-white/60 text-xs italic ml-2 flex-1 leading-4">
                {imageSession.note}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>


      {/* Content */}
      <ScrollView 
        className="flex-1 px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0171a5']}
            tintColor="#0171a5"
          />
        }
      >
        {images.length > 0 && (
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              Hình ảnh ({images.length})
            </Text>

            <View className="flex-row bg-gray-200 rounded-full p-1">
              <TouchableOpacity
                onPress={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-full ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <Ionicons name="grid" size={20} color={viewMode === 'grid' ? '#0171a5' : '#6b7280'} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('list')}
                className={`px-4 py-2 rounded-full ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
              >
                <Ionicons name="list" size={20} color={viewMode === 'list' ? '#0171a5' : '#6b7280'} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Loading */}
        {isLoading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#0171a5" />
            <Text className="text-gray-500 mt-3">Đang tải hình ảnh...</Text>
          </View>
        )}

        {/* Empty */}
        {!isLoading && images.length === 0 && (
          <View className="items-center justify-center py-20">
            <Ionicons name="images-outline" size={80} color="#d1d5db" />
            <Text className="text-gray-700 font-semibold text-lg mt-4">Chưa có hình ảnh nào</Text>
            <Text className="text-gray-500 text-center mt-2 px-10">
              Nhấn nút + để thêm hình ảnh (tối đa 5 ảnh mỗi phiên)
            </Text>
          </View>
        )}

        {/* Nội dung ảnh */}
        {!isLoading && images.length > 0 && (
          <View>
            {viewMode === 'grid' ? (
              <View className="flex-row flex-wrap justify-between">
                {images.map(renderImageGrid)}
              </View>
            ) : (
              <View>{images.map(renderImageList)}</View>
            )}
          </View>
        )}

        <View className="h-20" />
      </ScrollView>

      {/* Modal xem ảnh lớn */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 bg-black">
          <SafeAreaView className="flex-1">
            <View className="flex-row items-center justify-between px-4 py-3">
              <TouchableOpacity onPress={() => setModalVisible(false)} className="bg-white/10 rounded-full p-2">
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>

              <View className="flex-row space-x-4">
                <TouchableOpacity className="bg-white/10 rounded-full p-2">
                  <Ionicons name="share-outline" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-white/10 rounded-full p-2">
                  <Ionicons name="download-outline" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-1 items-center justify-center">
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage.fileUrl }}
                  style={{ width, height: width * 1.2 }}
                  resizeMode="contain"
                />
              )}
            </View>

            {selectedImage && (
              <View className="px-5 py-4 bg-black/60">
                <Text className="text-white text-base">
                  {formatDateTime(selectedImage.takenAt)}
                </Text>
                {selectedImage.studentCountAi && (
                  <View className="flex-row items-center mt-2">
                    <Ionicons name="people" size={18} color="white" />
                    <Text className="text-white ml-2">
                      Phát hiện {selectedImage.studentCountAi} sinh viên
                    </Text>
                  </View>
                )}
              </View>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AttendanceImageScreen;