import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ImageViewerModal = ({
  visible,
  onClose,
  selectedImage,
  screenWidth,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black">
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between px-6 py-4">
            <Text className="text-white font-bold text-lg">
              {selectedImage?.name}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center">
            {selectedImage && (
              <Image
                source={{ uri: selectedImage.uri }}
                style={{
                  width: screenWidth,
                  height: screenWidth,
                }}
                resizeMode="contain"
              />
            )}
          </View>

          <View className="px-6 py-4">
            <Text className="text-white text-center text-sm">
              Pinch to zoom • Swipe to dismiss
            </Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default ImageViewerModal;
