import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';

import { getSurveyQuestions } from '../../features/survey/surveyThunks';
import {
  selectQuestions,
  selectQuestionsLoading,
  selectQuestionsError,
} from '../../features/survey/surveySlice';
import { getSurveyResponsesBySurvey, submitSurveyResponses } from '../../features/surveyResponse/surveyResponseThunks';
import {
  selectResponses,
  selectResponsesLoading,
  selectSubmitting,
} from '../../features/surveyResponse/surveyResponseSlice';

const SurveyQuestionScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { surveyId, courseName, courseCode } = route.params || {};

  const questions = useSelector(selectQuestions);
  const loading = useSelector(selectQuestionsLoading);
  const error = useSelector(selectQuestionsError);

  const responses = useSelector(selectResponses);
  const responsesLoading = useSelector(selectResponsesLoading);
  const submitting = useSelector(selectSubmitting);

  // 👉 Lưu câu trả lời
  const [answers, setAnswers] = useState({});
  const [hasResponses, setHasResponses] = useState(false);

  useEffect(() => {
    if (surveyId) {
      dispatch(getSurveyQuestions(surveyId));
      // Load responses
      dispatch(getSurveyResponsesBySurvey(surveyId));
    }
  }, [dispatch, surveyId]);

  // Map responses vào answers state
  useEffect(() => {
    if (responses.length > 0) {
      console.log('📝 Mapping responses:', responses);
      const answersMap = {};
      let hasData = false;
      
      responses.forEach((response) => {
        // Lưu cả rating VÀ response_text/response_option cho mỗi câu hỏi
        const answerData = {
          rating: response.rating,
          response_text: response.response_text,
          response_option: response.response_option, // Lấy response_option cho multiple choice
          question_type: response.question_type
        };
        
        // Nếu có dữ liệu (rating hoặc response_text hoặc response_option)
        if (response.rating !== null && response.rating !== undefined || 
            response.response_text || 
            (response.response_option && response.response_option.length > 0)) {
          answersMap[response.question_id] = answerData;
          hasData = true;
          console.log(`✅ Question ${response.question_id}:`, answerData);
        }
      });
      
      console.log('✅ Đã load answers với đầy đủ rating + response_text + response_option:', answersMap);
      setAnswers(answersMap);
      setHasResponses(hasData);
    }
  }, [responses]);

  // Debug: Log danh sách câu hỏi
  useEffect(() => {
    if (questions.length > 0) {
      console.log('========================= Danh sách câu hỏi:', JSON.stringify(questions, null, 2));
      console.log('............................. Tổng số câu hỏi:', questions.length);
      questions.forEach((q, index) => {
        console.log(`Câu ${index + 1}:`, {
          id: q.id,
          type: q.question_type,
          text: q.question_text,
          required: q.is_required,
          options: q.options
        });
      });
    }
  }, [questions]);

  const handleRefresh = () => {
    if (surveyId) {
      dispatch(getSurveyQuestions(surveyId));
      dispatch(getSurveyResponsesBySurvey(surveyId));
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    // kiểm tra câu bắt buộc
    const requiredQuestions = questions.filter((q) => q.is_required);

    for (let q of requiredQuestions) {
      if (!answers[q.id]) {
        Alert.alert('Thông báo', 'Vui lòng trả lời tất cả câu hỏi bắt buộc');
        return;
      }
    }

    // Format responses theo backend format
    const formattedResponses = questions.map((q) => {
      const answer = answers[q.id];
      const response = { question_id: q.id };

      if (q.question_type === 'rating') {
        response.rating = answer;
      } else if (q.question_type === 'text') {
        response.response_text = answer;
      } else if (q.question_type === 'multiple_choice') {
        response.response_option = [answer]; // Array format
      }

      return response;
    });

    console.log('📤 Submitting:', formattedResponses);

    try {
      await dispatch(
        submitSurveyResponses({ surveyId, responses: formattedResponses })
      ).unwrap();
      Alert.alert('Thành công', 'Bạn đã gửi khảo sát!');
      setHasResponses(true);
      // Reload responses
      dispatch(getSurveyResponsesBySurvey(surveyId));
    } catch (error) {
      Alert.alert('Lỗi', error || 'Không thể gửi khảo sát');
    }
  };

  const renderRating = (question) => {
    const answerData = answers[question.id];
    const selected = typeof answerData === 'object' ? answerData.rating : (answerData || 0);
    const responseText = typeof answerData === 'object' ? answerData.response_text : '';

    // Nếu đã trả lời, hiển thị kết quả
    if (hasResponses) {
      return (
        <View className="mt-3 bg-blue-50 p-3 rounded-xl">
          <Text className="text-gray-600 text-sm mb-2">Đánh giá của bạn:</Text>
          <View className="flex-row items-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= selected ? 'star' : 'star-outline'}
                size={28}
                color="#f59e0b"
                style={{ marginRight: 4 }}
              />
            ))}
            <Text className="ml-2 text-blue-600 font-bold text-lg">
              {selected}/5
            </Text>
          </View>
          {responseText && (
            <View className="mt-2 pt-2 border-t border-blue-200">
              <Text className="text-gray-600 text-xs mb-1">Ghi chú:</Text>
              <Text className="text-gray-800 leading-5">{responseText}</Text>
            </View>
          )}
        </View>
      );
    }

    // Chưa trả lời, hiển thị input
    return (
      <View className="flex-row mt-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleAnswerChange(question.id, star)}
          >
            <Ionicons
              name={star <= selected ? 'star' : 'star-outline'}
              size={32}
              color="#f59e0b"
              style={{ marginRight: 6 }}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderMultipleChoice = (question) => {
    const answerData = answers[question.id];
    // Ưu tiên response_option (array), fallback về response_text
    const selectedOption = typeof answerData === 'object' 
      ? (answerData.response_option && answerData.response_option.length > 0 
          ? answerData.response_option[0] 
          : answerData.response_text)
      : answerData;
    const rating = typeof answerData === 'object' ? answerData.rating : null;

    // Nếu đã trả lời, hiển thị kết quả
    if (hasResponses) {
      return (
        <View className="mt-3 bg-blue-50 p-3 rounded-xl">
          <Text className="text-gray-600 text-sm mb-2">Lựa chọn của bạn:</Text>
          <View className="flex-row items-center mb-2">
            <Ionicons name="checkmark-circle" size={20} color="#10b981" />
            <Text className="ml-2 text-gray-800 font-semibold">{selectedOption}</Text>
          </View>
          {rating && (
            <View className="mt-2 pt-2 border-t border-blue-200 flex-row items-center">
              <Text className="text-gray-600 text-xs mr-2">Đánh giá:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={18}
                  color="#f59e0b"
                  style={{ marginRight: 2 }}
                />
              ))}
              <Text className="ml-1 text-gray-700 text-sm font-medium">{rating}/5</Text>
            </View>
          )}
        </View>
      );
    }

    // Chưa trả lời, hiển thị input
    return (
      <View className="mt-3">
        {question.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleAnswerChange(question.id, option)}
            className={`flex-row items-center p-3 mb-2 rounded-xl ${
              selectedOption === option ? 'bg-blue-100' : 'bg-gray-100'
            }`}
          >
            <Ionicons
              name={
                selectedOption === option
                  ? 'radio-button-on'
                  : 'radio-button-off'
              }
              size={20}
              color="#2563eb"
            />
            <Text className="ml-2 text-gray-800">{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderTextQuestion = (question) => {
    const answerData = answers[question.id];
    const answer = typeof answerData === 'object' ? answerData.response_text : (answerData || '');
    const rating = typeof answerData === 'object' ? answerData.rating : null;

    // Nếu đã trả lời, hiển thị kết quả
    if (hasResponses) {
      return (
        <View className="mt-3 bg-blue-50 p-4 rounded-xl">
          <Text className="text-gray-600 text-sm mb-2">Câu trả lời của bạn:</Text>
          <Text className="text-gray-800 leading-6 mb-2">
            {answer || '(Không có câu trả lời)'}
          </Text>
          {rating && (
            <View className="mt-2 pt-2 border-t border-blue-200 flex-row items-center">
              <Text className="text-gray-600 text-xs mr-2">Đánh giá:</Text>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={18}
                  color="#f59e0b"
                  style={{ marginRight: 2 }}
                />
              ))}
              <Text className="ml-1 text-gray-700 text-sm font-medium">{rating}/5</Text>
            </View>
          )}
        </View>
      );
    }

    // Chưa trả lời, hiển thị input
    return (
      <TextInput
        placeholder="Nhập câu trả lời..."
        value={answer}
        onChangeText={(text) =>
          handleAnswerChange(question.id, text)
        }
        multiline
        className="mt-3 bg-gray-100 rounded-xl p-3 text-gray-800"
      />
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="light" />

      <LinearGradient colors={['#2563eb', '#3b82f6']} className="px-5 pt-5 pb-8">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">
            Đánh giá môn học
          </Text>
        </View>

        {courseName && (
          <View className="mt-4 bg-white/10 p-3 rounded-2xl">
            <Text className="text-white font-semibold">{courseName}</Text>
            <Text className="text-white/80 text-sm">
              {courseCode}
            </Text>
          </View>
        )}
      </LinearGradient>

      {loading && questions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          className="px-5 mt-4"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
            />
          }
        >
          {questions.map((question, index) => (
            <View
              key={question.id}
              className={`p-4 rounded-2xl mb-4 shadow-sm ${
                hasResponses ? 'bg-white border-2 border-blue-100' : 'bg-white'
              }`}
            >
              <View className="flex-row items-start justify-between">
                <Text className="font-semibold text-gray-800 flex-1">
                  {index + 1}. {question.question_text}
                </Text>
                {hasResponses && (
                  <View className="bg-green-100 px-2 py-1 rounded-full">
                    <Text className="text-green-700 text-xs font-semibold">Đã trả lời</Text>
                  </View>
                )}
              </View>

              {/* Question ID - DEBUG */}
              <Text className="text-gray-400 text-xs mt-1">
                ID question: {question.id}
              </Text>

              {question.is_required && !hasResponses && (
                <Text className="text-red-500 text-xs mt-1">
                  * Bắt buộc
                </Text>
              )}

              {question.question_type === 'rating' &&
                renderRating(question)}

              {question.question_type === 'multiple_choice' &&
                renderMultipleChoice(question)}

              {question.question_type === 'text' &&
                renderTextQuestion(question)}
            </View>
          ))}

          {/* Hiển thị nút submit nếu chưa có responses */}
          {questions.length > 0 && !hasResponses && (
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={submitting}
              className="mb-10 shadow-lg shadow-blue-400"
            >
              <LinearGradient
                colors={submitting ? ['#9ca3af', '#6b7280'] : ['#2563eb', '#1d4ed8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-center py-4 rounded-2xl"
              >
                {submitting ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="text-white font-extrabold text-lg ml-2 italic">
                      ĐANG GỬI...
                    </Text>
                  </>
                ) : (
                  <>
                    <Text className="text-white font-extrabold text-lg mr-2 italic">
                      GỬI KHẢO SÁT
                    </Text>
                    <View className="bg-white/20 p-1.5 rounded-full">
                      <Ionicons name="paper-plane" size={18} color="#fff" />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Hiển thị thông báo nếu đã trả lời */}
          {hasResponses && (
            <View className="mb-10 bg-green-50 p-4 rounded-2xl border border-green-200">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                <Text className="text-green-700 font-semibold ml-2">
                  Bạn đã hoàn thành khảo sát này
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SurveyQuestionScreen;
