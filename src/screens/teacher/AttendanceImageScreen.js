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

const { width } = Dimensions.get('window');
const imageSize = (width - 48) / 3; // 3 columns with padding

const AttendanceImageScreen = ({ navigation, route }) => {
  const { imageSession, schedule } = route.params;
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // TODO: Fetch images for this image session from API
    // For now, using mock data
    loadImages();
  }, [imageSession?.id]);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const response = await fetchImagesBySessionId(imageSession.id);
      // setImages(response.data);
      
      // Mock data for demonstration
      setTimeout(() => {
        const mockImages = [
          {
            id: '1',
            url: 'https://via.placeholder.com/400x300/7c3aed/ffffff?text=Image+1',
            thumbnailUrl: 'https://via.placeholder.com/200x150/7c3aed/ffffff?text=Image+1',
            uploadedAt: new Date().toISOString(),
            studentCount: 12,
          },
          {
            id: '2',
            url: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Image+2',
            thumbnailUrl: 'https://via.placeholder.com/200x150/8b5cf6/ffffff?text=Image+2',
            uploadedAt: new Date().toISOString(),
            studentCount: 8,
          },
          {
            id: '3',
            url: 'https://via.placeholder.com/400x300/a78bfa/ffffff?text=Image+3',
            thumbnailUrl: 'https://via.placeholder.com/200x150/a78bfa/ffffff?text=Image+3',
            uploadedAt: new Date().toISOString(),
            studentCount: 15,
          },
        ];
        setImages(mockImages);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading images:', error);
      setIsLoading(false);
    }
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

  const renderImageItem = (image, index) => (
    <TouchableOpacity
      key={image.id || index}
      onPress={() => handleImagePress(image)}
      activeOpacity={0.7}
      className="mb-3"
      style={{ width: imageSize }}
    >
      <View className="rounded-xl overflow-hidden bg-gray-200" style={{ height: imageSize }}>
        <Image
          source={{ uri: image.thumbnailUrl || image.url }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        
        {/* Student count badge */}
        {image.studentCount && (
          <View className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex-row items-center">
            <Ionicons name="people" size={12} color="white" />
            <Text className="text-white text-xs font-bold ml-1">
              {image.studentCount}
            </Text>
          </View>
        )}
      </View>
      
      <Text className="text-gray-500 text-xs mt-1 text-center">
        {formatDateTime(image.uploadedAt).split(',')[1]?.trim() || ''}
      </Text>
    </TouchableOpacity>
  );

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

          <TouchableOpacity className="bg-white/20 rounded-full p-2">
            <Ionicons name="add" size={24} color="white" />
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
                  source={{ uri: selectedImage.url }}
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
                      {formatDateTime(selectedImage.uploadedAt)}
                    </Text>
                  </View>
                  
                  {selectedImage.studentCount && (
                    <View className="flex-row items-center bg-white/10 rounded-full px-3 py-1">
                      <Ionicons name="people" size={16} color="white" />
                      <Text className="text-white text-sm font-semibold ml-1">
                        {selectedImage.studentCount} sinh viên
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
