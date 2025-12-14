import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const SurveyScreen = ({ navigation, route }) => {
  const { schedule, attendanceId, viewMode = false, onSubmitSuccess } = route.params || {};
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock completed survey data (sẽ được lấy từ API dựa vào attendanceId)
  const mockCompletedSurvey = [
    {
      id: 1,
      question: 'Nội dung bài giảng có rõ ràng và dễ hiểu không?',
      type: 'rating',
      required: true,
      answer: 5,
    },
    {
      id: 2,
      question: 'Giảng viên có nhiệt tình và tận tâm không?',
      type: 'rating',
      required: true,
      answer: 5,
    },
    {
      id: 3,
      question: 'Tài liệu học tập có đầy đủ và phù hợp không?',
      type: 'rating',
      required: true,
      answer: 4,
    },
    {
      id: 4,
      question: 'Thời gian bài giảng có phù hợp không?',
      type: 'rating',
      required: false,
      answer: 4,
    },
    {
      id: 5,
      question: 'Bạn có gợi ý nào để cải thiện buổi học không?',
      type: 'text',
      required: false,
      answer: 'Giảng viên rất nhiệt tình và bài giảng dễ hiểu. Hy vọng có thêm nhiều bài tập thực hành.',
      placeholder: 'Nhập gợi ý của bạn (tùy chọn)...',
    },
  ];

  const initialSurveyData = [
    {
      id: 1,
      question: 'Nội dung bài giảng có rõ ràng và dễ hiểu không?',
      type: 'rating',
      required: true,
      answer: 0,
    },
    {
      id: 2,
      question: 'Giảng viên có nhiệt tình và tận tâm không?',
      type: 'rating',
      required: true,
      answer: 0,
    },
    {
      id: 3,
      question: 'Tài liệu học tập có đầy đủ và phù hợp không?',
      type: 'rating',
      required: true,
      answer: 0,
    },
    {
      id: 4,
      question: 'Thời gian bài giảng có phù hợp không?',
      type: 'rating',
      required: false,
      answer: 0,
    },
    {
      id: 5,
      question: 'Bạn có gợi ý nào để cải thiện buổi học không?',
      type: 'text',
      required: false,
      answer: '',
      placeholder: 'Nhập gợi ý của bạn (tùy chọn)...',
    },
  ];

  // Survey questions (có thể lấy từ API)
  const [surveyData, setSurveyData] = useState(viewMode ? mockCompletedSurvey : initialSurveyData);

  const handleRatingChange = (questionId, rating) => {
    setSurveyData(prevData =>
      prevData.map(item =>
        item.id === questionId ? { ...item, answer: rating } : item
      )
    );
  };

  const handleTextChange = (questionId, text) => {
    setSurveyData(prevData =>
      prevData.map(item =>
        item.id === questionId ? { ...item, answer: text } : item
      )
    );
  };

  const validateSurvey = () => {
    const requiredQuestions = surveyData.filter(q => q.required);
    for (let question of requiredQuestions) {
      if (question.type === 'rating' && question.answer === 0) {
        return false;
      }
      if (question.type === 'text' && !question.answer.trim()) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateSurvey()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to submit survey
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock API call
      console.log('Survey submitted:', {
        attendanceId,
        schedule,
        answers: surveyData,
      });

      setShowSuccessModal(true);
      
      // Gọi callback để cập nhật trạng thái ở màn hình trước
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      // Auto close after 2 seconds and navigate back
      setTimeout(() => {
        setShowSuccessModal(false);
        navigation.goBack();
      }, 2000);
    } catch (error) {
      console.error('Error submitting survey:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = validateSurvey();

  const renderStarRating = (question) => {
    return (
      <View className="flex-row justify-center mb-2" style={{ gap: 12 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => !viewMode && handleRatingChange(question.id, star)}
            activeOpacity={viewMode ? 1 : 0.7}
            disabled={viewMode}
          >
            <Ionicons
              name={star <= question.answer ? 'star' : 'star-outline'}
              size={40}
              color={star <= question.answer ? '#f59e0b' : '#d1d5db'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTextInput = (question) => {
    return (
      <TextInput
        value={question.answer}
        onChangeText={(text) => handleTextChange(question.id, text)}
        placeholder={question.placeholder || 'Nhập câu trả lời...'}
        placeholderTextColor="#9ca3af"
        multiline
        numberOfLines={4}
        editable={!viewMode}
        className={`rounded-xl p-4 text-gray-900 border ${viewMode ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200'}`}
        style={{
          minHeight: 100,
          textAlignVertical: 'top',
        }}
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1 ml-4">
            {viewMode ? 'Xem lại đánh giá' : 'Đánh giá buổi học'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {schedule && (
          <View className="bg-white/20 rounded-xl p-3">
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {schedule.courseName}
            </Text>
            <Text className="text-white/80 text-sm">
              {schedule.courseCode} • Phòng {schedule.room}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        className="flex-1 px-6 pt-6" 
        showsVerticalScrollIndicator={false}
      >
        {/* Intro */}
        {viewMode ? (
          <View className="bg-green-50 rounded-2xl p-4 mb-6 border border-green-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="checkmark-circle" size={24} color="#10b981" />
              <Text className="text-green-900 font-bold text-base ml-2">
                Đánh giá đã hoàn thành
              </Text>
            </View>
            <Text className="text-green-700 text-sm">
              Dưới đây là nội dung đánh giá bạn đã gửi cho buổi học này.
            </Text>
          </View>
        ) : (
          <View className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-200">
            <View className="flex-row items-center mb-2">
              <Ionicons name="information-circle" size={24} color="#2563eb" />
              <Text className="text-blue-900 font-bold text-base ml-2">
                Cảm ơn bạn đã tham gia buổi học!
              </Text>
            </View>
            <Text className="text-blue-700 text-sm">
              Vui lòng dành vài phút đánh giá chất lượng buổi học để giúp chúng tôi cải thiện hơn.
            </Text>
          </View>
        )}

        {/* Questions */}
        {surveyData.map((question, index) => (
          <View 
            key={question.id} 
            className="bg-white rounded-2xl p-5 mb-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            {/* Question Header */}
            <View className="flex-row items-start mb-4">
              <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-600 font-bold">{index + 1}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base leading-6">
                  {question.question}
                  {question.required && (
                    <Text className="text-red-500"> *</Text>
                  )}
                </Text>
                {!question.required && (
                  <Text className="text-gray-500 text-xs mt-1">(Tùy chọn)</Text>
                )}
              </View>
            </View>

            {/* Answer Input */}
            {question.type === 'rating' ? (
              <>
                {renderStarRating(question)}
                {question.answer > 0 && (
                  <Text className="text-center text-gray-600 text-sm mt-2">
                    {question.answer === 1 && 'Rất không hài lòng'}
                    {question.answer === 2 && 'Không hài lòng'}
                    {question.answer === 3 && 'Bình thường'}
                    {question.answer === 4 && 'Hài lòng'}
                    {question.answer === 5 && 'Rất hài lòng'}
                  </Text>
                )}
              </>
            ) : (
              renderTextInput(question)
            )}
          </View>
        ))}

        {/* Required Notice */}
        <View className="bg-yellow-50 rounded-xl p-3 mb-6 flex-row items-center border border-yellow-200">
          <Ionicons name="alert-circle" size={20} color="#f59e0b" />
          <Text className="text-yellow-800 text-sm ml-2 flex-1">
            <Text className="text-red-500 font-bold">* </Text>
            Câu hỏi bắt buộc
          </Text>
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Submit Button */}
      <View className="px-6 py-4 border-t border-gray-200 bg-white">
        {viewMode ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-gray-600 rounded-xl py-4 flex-row items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Quay lại
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className={`rounded-xl py-4 flex-row items-center justify-center ${
                isFormValid && !isSubmitting ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              style={{
                shadowColor: isFormValid ? '#2563eb' : '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isFormValid ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: isFormValid ? 5 : 2,
              }}
            >
              {isSubmitting ? (
                <>
                  <Ionicons name="hourglass-outline" size={24} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Đang gửi...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text className="text-white font-bold text-base ml-2">
                    Hoàn tất khảo sát
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {!isFormValid && (
              <Text className="text-red-500 text-xs text-center mt-2">
                Vui lòng trả lời tất cả các câu hỏi bắt buộc
              </Text>
            )}
          </>
        )}
      </View>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center">
          <View className="bg-white rounded-3xl p-8 mx-8" style={{ width: width * 0.85 }}>
            <View className="items-center">
              <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="checkmark-circle" size={60} color="#10b981" />
              </View>
              
              <Text className="text-gray-900 font-bold text-2xl mb-2 text-center">
                Cảm ơn đánh giá!
              </Text>
              
              <Text className="text-gray-600 text-base text-center leading-6">
                Phản hồi của bạn rất quan trọng và sẽ giúp chúng tôi cải thiện chất lượng giảng dạy.
              </Text>

              <View className="w-full bg-green-50 rounded-xl p-4 mt-4">
                <View className="flex-row items-center justify-center">
                  <Ionicons name="trophy" size={24} color="#10b981" />
                  <Text className="text-green-700 font-bold text-base ml-2">
                    +5 điểm tích cực
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SurveyScreen;
