import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Image
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

  const handleSkip = () => {
    navigation.navigate('RoleSelection');
  };

  const renderDots = () => {
    return (
      <View className="flex-row justify-center items-center mb-8">
        {slides.map((_, index) => (
          <View
            key={index}
            className={`h-2 rounded-full mx-1 ${
              index === currentIndex
                ? 'bg-white w-8'
                : 'bg-white/30 w-2'
            }`}
          />
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={['#132440', '#9333ea', '#DD7BDF']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      className="flex-1"
    >
      <StatusBar style="light" />
      
      {/* Skip Button */}
      {currentIndex < slides.length - 1 && (
        <TouchableOpacity
          onPress={handleSkip}
          className="absolute top-12 right-6 z-10 bg-white/20 px-4 py-2 rounded-full"
        >
          <Text className="text-white font-semibold">Bỏ qua</Text>
        </TouchableOpacity>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-1"
      >
        {slides.map((slide) => (
          <View
            key={slide.id}
            style={{ width, height }}
            className="flex-1 justify-center items-center px-8"
          >
            <View className="items-center justify-center flex-1">
              <Image source={slide.image} className="w-64 h-64 mb-8" />
              <Text className="text-white text-3xl font-bold text-center mb-4">{slide.title}</Text>
              <Text className="text-white/90 text-lg text-center leading-6">{slide.description}</Text>

              {slide.isLast && (
                <View className="mt-12 w-full">
                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login', { role: 'student' })}
                    className="bg-white rounded-2xl py-5 px-8 mb-4"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <Image source={require('../../assets/images/student.png')} className="w-9 h-9" />
                      <Text className="text-xl font-bold" style={{ color: '#16476A' }}> Tôi là Sinh viên</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('Login', { role: 'teacher' })}
                    className="rounded-2xl py-5 px-8"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 4,
                      elevation: 5,
                      backgroundColor: '#DD7BDF'
                    }}
                  >
                    <View className="flex-row items-center justify-center">
                      <Image source={require('../../assets/images/teacher.png')} className="w-9 h-9" />
                      <Text className="text-white text-xl font-bold">Tôi là Giảng viên</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <View className="pb-12">
        {renderDots()}
        {currentIndex < slides.length - 1 && (
          <View className="px-8">
            <TouchableOpacity
              onPress={handleNext}
              className="bg-white rounded-full py-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Text className="text-blue-600 text-center text-lg font-bold">Tiếp theo</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

export default IntroCarouselScreen;
