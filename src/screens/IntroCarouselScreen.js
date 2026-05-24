import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { slides } from '../data/slideWelcomes';

const { width, height } = Dimensions.get('window');

const IntroCarouselScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      scrollViewRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
    }
  };

  const renderDots = () => {
    return (
      <View className="flex-row justify-center items-center mb-6">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-1.5 rounded-full mx-1 transition-all duration-300 ${
              index === currentIndex
                ? 'bg-blue-500 w-6'
                : 'bg-gray-200 w-1.5'
            }`}
          />
        ))}
      </View>
    );
  };

  return (
    // Sử dụng màu nền cực nhẹ (off-white) để tạo cảm giác sang trọng
    <View className="flex-1 bg-[#EBEBE3]">
      <StatusBar style="dark" />
      
      <SafeAreaView className="flex-1">
        {/* Skip Button - Làm mờ và thanh thoát hơn */}
        {currentIndex < slides.length - 1 && (
          <TouchableOpacity
            onPress={() => navigation.navigate('RoleSelection')}
            className="absolute top-12 right-6 z-10"
          >
            <Text className="text-gray-400 font-medium">Bỏ qua</Text>
          </TouchableOpacity>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {slides.map((slide) => (
            <View key={slide.id} style={{ width }} className="px-10 justify-center items-center">
              <View className="w-full items-center">
                {/* Ảnh: Thêm một lớp nền tròn nhạt phía sau ảnh để tạo chiều sâu */}
                <View className="bg-blue-50 rounded-full p-10 mb-10">
                   <Image source={slide.image} className="w-60 h-60" resizeMode="contain" />
                </View>

                <Text className="text-[#1E293B] text-2xl font-extrabold text-center mb-4 tracking-tight">
                  {slide.title}
                </Text>
                <Text className="text-gray-500 text-base text-center leading-6 px-4">
                  {slide.description}
                </Text>

                {slide.isLast && (
                  <View className="mt-10 w-full">
                    {/* Nút Sinh Viên - Tone White/Blue sạch sẽ */}
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Login', { role: 'student' })}
                      activeOpacity={0.8}
                      className="bg-white border border-gray-100 flex-row items-center justify-center py-4 mb-4 shadow-sm"
                    >
                      <Image source={require('../../assets/images/student.png')} className="w-6 h-6 mr-3" />
                      <Text className="text-gray-800 text-lg font-bold">Tôi là Sinh viên</Text>
                    </TouchableOpacity>

                    {/* Nút Giảng Viên - Tone Blue hiện đại */}
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Login', { role: 'teacher' })}
                      activeOpacity={0.8}
                      className="bg-[#3B82F6] flex-row items-center justify-center py-4 shadow-md shadow-blue-200"
                    >
                      <Image source={require('../../assets/images/teacher.png')} className="w-6 h-6 mr-3" tintColor="white" />
                      <Text className="text-white text-lg font-bold">Tôi là Giảng viên</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="pb-10">
          {renderDots()}
          {currentIndex < slides.length - 1 && (
            <View className="px-10">
              <TouchableOpacity
                onPress={handleNext}
                activeOpacity={0.7}
                className="bg-blue-500 py-4"
              >
                <Text className="text-white text-center text-lg font-bold">Tiếp theo</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

export default IntroCarouselScreen;