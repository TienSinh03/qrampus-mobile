import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';

import { getStudentSurveys } from '../../features/survey/surveyThunks';
import {
  selectFilteredSurveyItems,
  selectLoading,
  selectError,
  selectSearchKeyword,
  setSearchKeyword,
} from '../../features/survey/surveySlice';

const surveyListSvgSource = Image.resolveAssetSource(
  require('../../../assets/svg_listsurvey.svg')
);
const surveyListSvgUri =
  surveyListSvgSource?.uri || surveyListSvgSource?.localUri || null;

const formatDate = (dateValue) => {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('vi-VN');
};

const SurveyListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const items = useSelector(selectFilteredSurveyItems);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const keyword = useSelector(selectSearchKeyword);

  useFocusEffect(
    React.useCallback(() => {
      dispatch(getStudentSurveys());
    }, [dispatch])
  );

  const sortedItems = useMemo(() => {
    const now = new Date();
    return [...items].sort((a, b) => {
      const getSortKey = (item) => {
        if (!item.hasSurvey) return 3; // chưa có khảo sát → cuối
        const survey = item.surveys[0];
        const isActive = survey.is_active === true;
        const isExpired = survey.closes_at ? new Date(survey.closes_at) < now : false;
        const canDo = isActive && !isExpired;
        const isCompleted = survey.questions?.some((q) => q.responses?.length > 0) ?? false;
        if (canDo && !isCompleted) return 0; // đang mở, chưa làm → ưu tiên nhất
        if (isCompleted) return 1;           // đã làm
        return 2;                            // hết hạn, chưa làm
      };
      return getSortKey(a) - getSortKey(b);
    });
  }, [items]);

  const handlePress = (item, canDo, isCompleted) => {
    if (!item.hasSurvey || !item.surveys?.length) return;
    if (!canDo && !isCompleted) return; // hết hạn + chưa làm → không cho mở
    navigation.navigate('SurveyQuestion', {
      surveyId: item.surveys[0].id,
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
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-4 pb-6 overflow-hidden"
      >
        {!!surveyListSvgUri && (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', right: 0, bottom: 0, width: 100, height: 100, opacity: 0.15 }}
          >
            <SvgUri uri={surveyListSvgUri} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
          </View>
        )}

        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: '#ffffff25' }}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <View className="items-center flex-1">
            <Text className="text-white text-lg font-bold">Khảo sát môn học</Text>
            <Text className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Danh sách khảo sát của bạn
            </Text>
          </View>

          <View className="w-10 h-10" />
        </View>
      </LinearGradient>

      {/* SEARCH BAR — cố định giữa header và list */}
      <View className="px-5 mt-3 mb-1">
        <View
          className="flex-row items-center bg-white rounded-xl px-4 py-3"
          style={{ elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 }}
        >
          <Ionicons name="search-outline" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 ml-3 text-gray-900"
            placeholder="Tìm theo tên hoặc mã môn..."
            placeholderTextColor="#9ca3af"
            value={keyword}
            onChangeText={(t) => dispatch(setSearchKeyword(t))}
          />
          {keyword.length > 0 && (
            <TouchableOpacity onPress={() => dispatch(setSearchKeyword(''))}>
              <Ionicons name="close-circle" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && (
        <View className="mx-5 mt-4 bg-red-50 p-4 rounded-2xl">
          <Text className="text-red-600">{error}</Text>
        </View>
      )}

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
          showsVerticalScrollIndicator={false}
        >
          {sortedItems.map((item) => {
            const now = new Date();
            const survey = item.hasSurvey && item.surveys?.length > 0 ? item.surveys[0] : null;
            const isActive = survey?.is_active === true;
            const isExpired = survey?.closes_at ? new Date(survey.closes_at) < now : false;
            const canDo = isActive && !isExpired;
            const isCompleted = survey?.questions?.some((q) => q.responses?.length > 0) ?? false;
            const isPractice = item.learningType === 'practice';
            const closesAtLabel = formatDate(survey?.closes_at);

            // status: 'none' | 'pending' | 'completed' | 'missed'
            const status = !survey ? 'none'
              : isCompleted ? 'completed'
              : canDo ? 'pending'
              : 'missed';

            const tappable = status === 'pending' || status === 'completed';

            const theme = {
              none: {
                cardBg: '#f8fafc', cardBorder: '#e2e8f0',
                iconBg: '#e2e8f0', iconColor: '#64748b',
                accentColor: '#94a3b8', statusBg: '#e2e8f0',
                statusText: '#475569', svgOpacity: 0.09,
                stripColor: '#e2e8f0',
              },
              pending: {
                cardBg: '#eff6ff', cardBorder: '#bfdbfe',
                iconBg: '#dbeafe', iconColor: '#2563eb',
                accentColor: '#3b82f6', statusBg: '#bfdbfe',
                statusText: '#1d4ed8', svgOpacity: 0.12,
                stripColor: '#3b82f6',
              },
              completed: {
                cardBg: '#ecfdf5', cardBorder: '#a7f3d0',
                iconBg: '#d1fae5', iconColor: '#059669',
                accentColor: '#10b981', statusBg: '#bbf7d0',
                statusText: '#166534', svgOpacity: 0.12,
                stripColor: '#10b981',
              },
              missed: {
                cardBg: '#fff7ed', cardBorder: '#fed7aa',
                iconBg: '#ffedd5', iconColor: '#ea580c',
                accentColor: '#f97316', statusBg: '#ffedd5',
                statusText: '#c2410c', svgOpacity: 0.1,
                stripColor: '#f97316',
              },
            }[status];

            return (
              <TouchableOpacity
                key={item.enrollmentId}
                activeOpacity={tappable ? 0.8 : 1}
                disabled={!tappable}
                onPress={() => handlePress(item, canDo, isCompleted)}
                className="relative mb-4 rounded-b-xl overflow-hidden border"
                style={{
                  backgroundColor: theme.cardBg,
                  borderColor: theme.cardBorder,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  elevation: 3,
                }}
              >
                {/* Strip màu trên cùng */}
                <View style={{ height: 4, backgroundColor: theme.stripColor }} />

                <View className="p-5">
                  {!!surveyListSvgUri && (
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        right: -10,
                        bottom: 0,
                        width: 90,
                        height: 90,
                        // do mo
                        opacity: 0.28,
                      }}
                    >
                      <SvgUri uri={surveyListSvgUri} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
                    </View>
                  )}

                  {/* HEADER ROW */}
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: theme.iconBg }}
                      >
                        <Ionicons name="book-outline" size={20} color={theme.iconColor} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
                          {item.courseName}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {item.courseCode} • {item.semester}
                        </Text>
                      </View>
                    </View>
                    {tappable && (
                      <Ionicons name="chevron-forward" size={20} color={theme.accentColor} />
                    )}
                  </View>

                  {/* LEARNING TYPE */}
                  <View className="flex-row items-center mt-2 ml-1">
                    <Ionicons
                      name={isPractice ? 'flask-outline' : 'school-outline'}
                      size={16}
                      color={isPractice ? '#0171a5' : theme.iconColor}
                    />
                    <Text className="text-sm text-gray-600 ml-2">
                      {isPractice ? `Thực hành • Nhóm ${item.practiceGroupNumber}` : 'Lý thuyết'}
                    </Text>
                  </View>

                  {/* HẠN CUỐI */}
                  {closesAtLabel && (
                    <View className="flex-row items-center mt-1 ml-1">
                      <Ionicons
                        name={isExpired ? 'time' : 'time-outline'}
                        size={14}
                        color={isExpired ? '#f97316' : '#6b7280'}
                      />
                      <Text
                        className="text-xs ml-1.5"
                        style={{ color: isExpired ? '#f97316' : '#6b7280' }}
                      >
                        {isExpired ? 'Đã hết hạn: ' : 'Hạn cuối: '}{closesAtLabel}
                      </Text>
                    </View>
                  )}

                  {/* STATUS BADGE */}
                  <View className="flex-row mt-3 items-center gap-2">
                    <View className="px-3 py-1 rounded-full" style={{ backgroundColor: theme.statusBg }}>
                      <Text className="text-xs font-semibold" style={{ color: theme.statusText }}>
                        {status === 'completed' && '✓ Đã hoàn thành'}
                        {status === 'pending' && 'Chưa hoàn thành'}
                        {status === 'missed' && 'Không hoàn thành'}
                        {status === 'none' && 'Chưa tạo khảo sát'}
                      </Text>
                    </View>

                    {status === 'missed' && (
                      <Ionicons name="alert-circle-outline" size={15} color="#f97316" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {sortedItems.length === 0 && !loading && (
            <View className="items-center mt-20">
              <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-3">Không có môn học nào</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SurveyListScreen;
