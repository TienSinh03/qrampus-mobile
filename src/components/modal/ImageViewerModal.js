import React from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ImageViewer from 'react-native-image-zoom-viewer';

const ImageViewerModal = ({
  visible,
  onClose,
  selectedImage,
  screenWidth,
}) => {
  const images = selectedImage ? [{ url: selectedImage.url }] : [];

  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-black">
        <View className="absolute top-0 right-0 z-10 p-4">
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <ImageViewer
          imageUrls={images}
          enableSwipeDown={true}
          onSwipeDown={onClose}
          enableImageZoom={true}
          saveToLocalByLongPress={false}
          backgroundColor="black"
        />
      </SafeAreaView>
    </Modal>
  );
};

export default ImageViewerModal;
