import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
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

const SurveyQuestionScreen = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const { surveyId, courseName, courseCode } = route.params || {};

  const questions = useSelector(selectQuestions);
  const loading = useSelector(selectQuestionsLoading);
  const error = useSelector(selectQuestionsError);

  useEffect(() => {
    if (surveyId) {
      dispatch(getSurveyQuestions(surveyId));
    }
  }, [dispatch, surveyId]);

  const handleRefresh = () => {
    if (surveyId) {
      dispatch(getSurveyQuestions(surveyId));
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'rating':
        return 'Đánh giá';
      case 'multiple_choice':
        return 'Trắc nghiệm';
      case 'text':
        return 'Văn bản';
      default:
        return type;
    }
  };

  const getQuestionTypeIcon = (type) => {
    switch (type) {
      case 'rating':
        return 'star-outline';
      case 'multiple_choice':
        return 'checkbox-outline';
      case 'text':
        return 'text-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getQuestionTypeColor = (type) => {
    switch (type) {
      case 'rating':
        return '#f59e0b';
      case 'multiple_choice':
        return '#3b82f6';
      case 'text':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="light" />

      {/* HEADER */}
      <LinearGradient colors={['#2563eb', '#3b82f6']} className="px-5 pt-5 pb-8">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              Câu hỏi khảo sát
            </Text>
          </View>
        </View>

        {courseName && (
          <View className="bg-white/10 rounded-2xl px-4 py-3">
            <Text className="text-white text-lg font-semibold">
              {courseName}
            </Text>
            {courseCode && (
              <Text className="text-white/80 text-sm mt-1">
                Mã môn: {courseCode}
              </Text>
            )}
          </View>
        )}
      </LinearGradient>

      {/* ERROR */}
      {error && (
        <View className="mx-5 mt-4 bg-red-50 p-4 rounded-2xl">
          <View className="flex-row items-center">
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text className="text-red-600 ml-2 flex-1">{error}</Text>
          </View>
        </View>
      )}

      {/* LOADING */}
      {loading && questions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-500 mt-4">Đang tải câu hỏi...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-5 mt-4"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={handleRefresh}
              colors={['#2563eb']}
              tintColor="#2563eb"
            />
          }
        >
          {/* QUESTION COUNT */}
          {questions.length > 0 && (
            <View className="bg-blue-50 rounded-2xl p-4 mb-4">
              <View className="flex-row items-center">
                <Ionicons name="list" size={24} color="#2563eb" />
                <Text className="text-blue-900 text-lg font-semibold ml-3">
                  Tổng số câu hỏi: {questions.length}
                </Text>
              </View>
              <Text className="text-blue-700 text-sm mt-2">
                {questions.filter((q) => q.is_required).length} câu bắt buộc
              </Text>
            </View>
          )}

          {/* QUESTIONS LIST */}
          {questions.map((question, index) => (
            <View
              key={question.id}
              className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
            >
              {/* Question Header */}
              <View className="flex-row items-start mb-3">
                <View className="bg-blue-100 rounded-full w-8 h-8 items-center justify-center mr-3">
                  <Text className="text-blue-600 font-bold">
                    {index + 1}
                  </Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center mb-2">
                    <View
                      className="px-3 py-1 rounded-full mr-2"
                      style={{ backgroundColor: `${getQuestionTypeColor(question.question_type)}20` }}
                    >
                      <View className="flex-row items-center">
                        <Ionicons
                          name={getQuestionTypeIcon(question.question_type)}
                          size={14}
                          color={getQuestionTypeColor(question.question_type)}
                        />
                        <Text
                          className="text-xs font-semibold ml-1"
                          style={{ color: getQuestionTypeColor(question.question_type) }}
                        >
                          {getQuestionTypeLabel(question.question_type)}
                        </Text>
                      </View>
                    </View>
                    {question.is_required && (
                      <View className="bg-red-100 px-2 py-1 rounded-full">
                        <Text className="text-red-600 text-xs font-semibold">
                          Bắt buộc
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-800 text-base leading-6">
                    {question.question_text}
                  </Text>
                </View>
              </View>

              {/* Question Options (if applicable) */}
              {question.options && question.options.length > 0 && (
                <View className="mt-3 pl-11 border-t border-gray-100 pt-3">
                  <Text className="text-gray-500 text-sm mb-2">Các lựa chọn:</Text>
                  {question.options.map((option, optIndex) => (
                    <View key={optIndex} className="flex-row items-center mb-2">
                      <View className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                      <Text className="text-gray-700 text-sm">{option}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Question Type Info for Rating */}
              {question.question_type === 'rating' && (
                <View className="mt-3 pl-11 border-t border-gray-100 pt-3">
                  <View className="flex-row items-center">
                    <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-500 text-xs ml-1">
                      Đánh giá theo thang điểm từ 1-5 sao
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ))}

          {/* EMPTY STATE */}
          {!loading && questions.length === 0 && (
            <View className="flex-1 justify-center items-center py-20">
              <View className="bg-gray-200 rounded-full p-6 mb-4">
                <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
              </View>
              <Text className="text-gray-900 text-xl font-bold mb-2">
                Không có câu hỏi
              </Text>
              <Text className="text-gray-500 text-base text-center mb-6 px-8">
                Khảo sát này chưa có câu hỏi nào
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                className="bg-blue-600 px-6 py-3 rounded-full flex-row items-center"
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text className="text-white font-semibold ml-2">
                  Tải lại
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ACTION BUTTON */}
          {questions.length > 0 && (
            <TouchableOpacity
              className="bg-blue-600 rounded-2xl py-4 mb-6 shadow-lg"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-center">
                <Ionicons name="create-outline" size={24} color="#fff" />
                <Text className="text-white text-lg font-bold ml-2">
                  Bắt đầu khảo sát
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SurveyQuestionScreen;
