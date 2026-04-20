import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import useCollapsibleHeader from '../../hooks/useCollapsibleHeader';

import { getStudentSurveys } from '../../features/survey/surveyThunks';
import {
  selectFilteredSurveyItems,
  selectLoading,
  selectError,
  selectSearchKeyword,
  setSearchKeyword,
} from '../../features/survey/surveySlice';
import { checkSurveyCompletion } from '../../features/surveyResponse/surveyResponseThunks';
import { selectCompletionStatuses } from '../../features/surveyResponse/surveyResponseSlice';

const { width } = Dimensions.get('window');
const surveyListSvgSource = Image.resolveAssetSource(
  require('../../../assets/svg_listsurvey.svg')
);
const surveyListSvgUri =
  surveyListSvgSource?.uri || surveyListSvgSource?.localUri || null;

const SurveyListScreen = ({ navigation }) => {
  
  const { animatedHeight, animatedOpacity, animatedTranslateY, handleScroll, handleMomentumScrollBegin } = useCollapsibleHeader(width * 0.2);
  
  const dispatch = useDispatch();
  const items = useSelector(selectFilteredSurveyItems);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const keyword = useSelector(selectSearchKeyword);
  const completionStatuses = useSelector(selectCompletionStatuses);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getStudentSurveys());
    }, [dispatch])
  );

  // Kiểm tra completion status cho các survey
  useEffect(() => {
    if (items.length > 0) {
      items.forEach(item => {
        if (item.hasSurvey && item.surveys && item.surveys.length > 0) {
          const surveyId = item.surveys[0].id;
          // Chỉ check nếu chưa có trong cache
          if (!completionStatuses[surveyId]) {
            dispatch(checkSurveyCompletion(surveyId));
          }
        }
      });
    }
  }, [items, dispatch, completionStatuses]);

  useFocusEffect(
    React.useCallback(() => {
      if (items.length === 0) {
        return;
      }

      items.forEach((item) => {
        if (item.hasSurvey && item.surveys && item.surveys.length > 0) {
          dispatch(checkSurveyCompletion(item.surveys[0].id));
        }
      });
    }, [items, dispatch])
  );

  /** 🔥 Có khảo sát lên đầu */
  const sortedItems = useMemo(() => {
    return [...items].sort(
      (a, b) => Number(b.hasSurvey) - Number(a.hasSurvey)
    );
  }, [items]);

  const handlePress = (item) => {
    // console.log('===== SURVEY ITEM =====');
    // console.log(item);
    // console.log('=======================');
    
    if (!item.hasSurvey || !item.surveys || item.surveys.length === 0) {
      return;
    }

    // Lấy survey đầu tiên
    const survey = item.surveys[0];

    navigation.navigate('SurveyQuestion', {
      surveyId: survey.id,
      courseName: item.courseName,
      courseCode: item.courseCode,
      semester: item.semester,
      learningType: item.learningType,
      practiceGroupName: item.practiceGroupName,
      practiceGroupNumber: item.practiceGroupNumber,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="light" />

      {/* HEADER */}
      <LinearGradient colors={['#2563eb', '#3b82f6']} className="px-5 pt-5">
        {/* Title row với back button */}
        <View className="flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 w-9 h-9 items-center justify-center rounded-full bg-white/20"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Khảo sát môn học</Text>
        </View>

        {/* Search bar - thu gọn khi scroll */}
        <Animated.View
          style={{
            height: animatedHeight,
            opacity: animatedOpacity,
            transform: [{ translateY: animatedTranslateY }],
            overflow: 'hidden',
          }}
        >
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-3">
            <Ionicons name="search-outline" size={20} color="#6b7280" />
            <TextInput
              className="flex-1 ml-3 text-base py-1"
              placeholder="Tìm theo tên hoặc mã môn"
              value={keyword}
              onChangeText={(t) => dispatch(setSearchKeyword(t))}
            />
          </View>
        </Animated.View>
      </LinearGradient>

      {/* ERROR */}
      {error && (
        <View className="mx-5 mt-4 bg-red-50 p-4 rounded-2xl">
          <Text className="text-red-600">{error}</Text>
        </View>
      )}

      {/* LIST */}
      {loading && sortedItems.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView
          className="px-5 mt-4"
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => dispatch(getStudentSurveys())}
            />
          }
          onScroll={handleScroll}
          onMomentumScrollBegin={handleMomentumScrollBegin}
          scrollEventThrottle={16}
        >
          {sortedItems.map((item) => {
            const disabled = !item.hasSurvey;
            const isPractice = item.learningType === 'practice';
            const surveyId = item.surveys && item.surveys.length > 0 ? item.surveys[0].id : null;
            const completionStatus = surveyId ? completionStatuses[surveyId] : null;
            const isCompleted = completionStatus?.isComplete || false;
            const cardTheme = !item.hasSurvey
              ? {
                  cardBg: '#f8fafc',
                  cardBorder: '#e2e8f0',
                  iconBg: '#e2e8f0',
                  iconColor: '#64748b',
                  accentColor: '#94a3b8',
                  statusBg: '#e2e8f0',
                  statusText: '#475569',
                  svgOpacity: 0.09,
                }
              : isCompleted
              ? {
                  cardBg: '#ecfdf5',
                  cardBorder: '#a7f3d0',
                  iconBg: '#d1fae5',
                  iconColor: '#059669',
                  accentColor: '#10b981',
                  statusBg: '#bbf7d0',
                  statusText: '#166534',
                  svgOpacity: 0.12,
                }
              : {
                  cardBg: '#eff6ff',
                  cardBorder: '#bfdbfe',
                  iconBg: '#dbeafe',
                  iconColor: '#2563eb',
                  accentColor: '#3b82f6',
                  statusBg: '#bfdbfe',
                  statusText: '#1d4ed8',
                  svgOpacity: 0.12,
                };

            return (
              <TouchableOpacity
                key={item.enrollmentId}
                activeOpacity={0.8}
                disabled={disabled}
                onPress={() => handlePress(item)}
                className="relative mb-4 rounded-2xl p-5 overflow-hidden border"
                style={{
                  backgroundColor: cardTheme.cardBg,
                  borderColor: cardTheme.cardBorder,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 3,
                }}
              >
                {!!surveyListSvgUri && (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      right: -10,
                      bottom: 0,
                      width: 90,
                      height: 90,
                      opacity: cardTheme.svgOpacity,
                    }}
                  >
                    <SvgUri
                      uri={surveyListSvgUri}
                      width="100%"
                      height="100%"
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </View>
                )}

                {/* HEADER */}
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center flex-1">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center mr-3"
                      style={{ backgroundColor: cardTheme.iconBg }}
                    >
                      <Ionicons name="book-outline" size={20} color={cardTheme.iconColor} />
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900">
                        {item.courseName}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.courseCode} • {item.semester}
                      </Text>
                    </View>
                  </View>

                  {!disabled && (
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={cardTheme.accentColor}
                    />
                  )}
                </View>

                {/* LEARNING TYPE */}
                <View className="flex-row items-center mt-2 ml-1">
                  <Ionicons
                    name={isPractice ? 'flask-outline' : 'school-outline'}
                    size={16}
                    color={isPractice ? '#0171a5' : cardTheme.iconColor}
                  />
                  <Text className="text-sm text-gray-600 ml-2">
                    {isPractice
                      ? `Thực hành • Nhóm ${item.practiceGroupNumber}`
                      : 'Lý thuyết'}
                  </Text>
                </View>

                {/* SURVEY ID - DEBUG */}
                {item.hasSurvey && item.surveys && item.surveys.length > 0 && (
                  <View className="ml-1 mt-2">
                    <Text className="text-xs text-gray-400">
                      ID KS: {item.surveys[0].id}
                    </Text>
                  </View>
                )}

                {/* STATUS */}
                <View className="flex-row mt-3">
                  {item.hasSurvey ? (
                    isCompleted ? (
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: cardTheme.statusBg }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: cardTheme.statusText }}>
                          ✓ Đã hoàn thành khảo sát
                        </Text>
                      </View>
                    ) : (
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: cardTheme.statusBg }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: cardTheme.statusText }}>
                          Chưa hoàn thành khảo sát
                        </Text>
                      </View>
                    )
                  ) : (
                    <View
                      className="px-3 py-1 rounded-full"
                      style={{ backgroundColor: cardTheme.statusBg }}
                    >
                      <Text className="text-xs font-semibold" style={{ color: cardTheme.statusText }}>
                        Chưa có khảo sát
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {sortedItems.length === 0 && !loading && (
            <View className="items-center mt-20">
              <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-3">
                Không có môn học nào
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SurveyListScreen;
