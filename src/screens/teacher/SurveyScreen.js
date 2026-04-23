import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import axiosInstance from '../../api/axiosInstance';

const audiobookSvgUri = Image.resolveAssetSource(
  require('../../../assets/Checklist-cuate.svg')
).uri;

const formatDate = (v) => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN');
};

const StarBar = ({ star, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View className="flex-row items-center mt-1">
      <Text className="text-gray-400 text-xs" style={{ width: 10 }}>{star}</Text>
      <Ionicons name="star" size={9} color="#f59e0b" style={{ marginHorizontal: 3 }} />
      <View className="flex-1 bg-gray-200 rounded-full mx-2" style={{ height: 5 }}>
        <View className="bg-amber-400 rounded-full" style={{ width: `${pct}%`, height: 5 }} />
      </View>
      <Text className="text-gray-400 text-xs" style={{ width: 16, textAlign: 'right' }}>{count}</Text>
    </View>
  );
};

const QuestionCard = ({ q, index }) => (
  <View className="bg-gray-50 rounded-xl p-3 mb-2 border border-gray-100">
    <Text className="text-gray-700 text-sm font-medium mb-2">
      {index + 1}. {q.question_text}
    </Text>

    {q.question_type === 'rating' && (
      <View>
        <View className="flex-row items-center mb-1.5">
          {[...Array(5)].map((_, i) => (
            <Ionicons
              key={i}
              name={i < Math.round(q.avg_rating) ? 'star' : 'star-outline'}
              size={13}
              color="#f59e0b"
              style={{ marginRight: 1 }}
            />
          ))}
          <Text className="text-amber-600 font-bold text-sm ml-1.5">
            {Number(q.avg_rating).toFixed(1)}/5
          </Text>
          <Text className="text-gray-400 text-xs ml-2">({q.total_answers} lượt)</Text>
        </View>
        {[5, 4, 3, 2, 1].map((star) => (
          <StarBar
            key={star}
            star={star}
            count={q[`star_${star}_count`] || 0}
            total={q.total_answers}
          />
        ))}
      </View>
    )}

    {q.question_type === 'multiple_choice' && (
      <View className="flex-row items-center">
        <Ionicons name="list-outline" size={14} color="#2563eb" />
        <Text className="text-blue-600 text-xs ml-1.5 font-medium">
          Trắc nghiệm • {q.total_answers} phản hồi
        </Text>
      </View>
    )}

    {q.question_type === 'text' && (
      <View className="flex-row items-center">
        <Ionicons name="chatbox-ellipses-outline" size={14} color="#10b981" />
        <Text className="text-emerald-600 text-xs ml-1.5 font-medium">
          {q.text_response_count} góp ý văn bản
        </Text>
      </View>
    )}
  </View>
);

const GroupCard = ({ group, detail }) => {
  const isPractice = group.class_type === 'THỰC HÀNH';
  const groupNum = group.practice_group_number;
  const enrolled = Number(group.total_students_enrolled ?? 0);
  const surveyed = Number(group.total_students_surveyed ?? 0);
  const avgRating = group.avg_rating ? Number(group.avg_rating) : null;
  const completionRate = enrolled > 0 ? Math.round((surveyed / enrolled) * 100) : 0;
  const overview = detail?.overview || {};
  const questionResults = detail?.question_results || [];

  return (
    <View
      className="bg-white rounded-2xl border border-gray-200 mb-4 overflow-hidden"
      style={{
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      }}
    >
      {/* Card header */}
      <View className="p-4 border-b border-gray-100">
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 mr-2">
            <Text className="text-gray-900 font-bold text-base" numberOfLines={1}>
              {group.course_section_code}
            </Text>
            <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={2}>
              {group.course_section_name}
            </Text>
          </View>
          {group.survey_id && (
            <View
              className="px-2 py-1 rounded-full"
              style={{ backgroundColor: group.survey_is_active ? '#dcfce7' : '#f1f5f9' }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: group.survey_is_active ? '#16a34a' : '#64748b' }}
              >
                {group.survey_is_active ? 'Đang mở' : 'Đã đóng'}
              </Text>
            </View>
          )}
        </View>

        {/* Badges */}
        <View className="flex-row flex-wrap" style={{ gap: 6 }}>
          <View className="bg-blue-50 px-2 py-0.5 rounded-full">
            <Text className="text-blue-600 text-xs">{group.semester}</Text>
          </View>
          <View
            className="px-2 py-0.5 rounded-full"
            style={{ backgroundColor: isPractice ? '#e0f2fe' : '#ede9fe' }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: isPractice ? '#0369a1' : '#6d28d9' }}
            >
              {isPractice
                ? `Thực hành • Nhóm TH${groupNum != null ? String(groupNum).padStart(2, '0') : ''}`
                : 'Lý thuyết'}
            </Text>
          </View>
          {group.survey_closes_at && (
            <View className="bg-orange-50 px-2 py-0.5 rounded-full">
              <Text className="text-orange-500 text-xs">
                Hạn: {formatDate(group.survey_closes_at)}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Thống kê tổng quan */}
      <View className="flex-row px-4 py-3 border-b border-gray-100">
        <View className="flex-1 items-center">
          <Text className="text-gray-900 font-bold text-xl">
            {surveyed}
            <Text className="text-gray-400 text-base">/{enrolled}</Text>
          </Text>
          <Text className="text-gray-400 text-xs mt-0.5">Đã phản hồi</Text>
        </View>

        <View className="w-px bg-gray-100" />

        <View className="flex-1 items-center">
          <Text className="text-emerald-600 font-bold text-xl">{completionRate}%</Text>
          <Text className="text-gray-400 text-xs mt-0.5">Hoàn thành</Text>
        </View>

        <View className="w-px bg-gray-100" />

        <View className="flex-1 items-center">
          {avgRating != null ? (
            <Text className="text-amber-500 font-bold text-xl">
              {avgRating.toFixed(1)}★
            </Text>
          ) : (
            <Text className="text-gray-300 font-bold text-xl">—</Text>
          )}
          <Text className="text-gray-400 text-xs mt-0.5">Điểm TB</Text>
        </View>
      </View>

      {/* Kết quả câu hỏi */}
      <View className="p-4">
        {!detail ? (
          <View className="items-center py-3">
            <ActivityIndicator size="small" color="#0171a5" />
            <Text className="text-gray-400 text-xs mt-1.5">Đang tải chi tiết...</Text>
          </View>
        ) : questionResults.length === 0 ? (
          <View className="bg-slate-50 rounded-xl p-3 items-center">
            <Text className="text-slate-400 text-sm">Chưa có câu trả lời nào.</Text>
          </View>
        ) : (
          <>
            <Text className="text-gray-700 font-bold text-sm mb-3">
              Kết quả từng câu hỏi
            </Text>
            {/* Mini overview từ statistics API */}
            {(overview.text_feedback_count > 0 || overview.total_responses > 0) && (
              <View className="bg-blue-50 rounded-xl px-3 py-2 mb-3 flex-row justify-between">
                <Text className="text-blue-700 text-xs">
                  Tổng lượt trả lời:{' '}
                  <Text className="font-bold">{overview.total_responses ?? 0}</Text>
                </Text>
                {overview.text_feedback_count > 0 && (
                  <Text className="text-blue-700 text-xs">
                    Góp ý:{' '}
                    <Text className="font-bold">{overview.text_feedback_count}</Text>
                  </Text>
                )}
              </View>
            )}
            {questionResults.map((q, qi) => (
              <QuestionCard key={qi} q={q} index={qi} />
            ))}
          </>
        )}
      </View>
    </View>
  );
};

const CLASS_TYPE_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Lý thuyết', value: 'LÝ THUYẾT' },
  { label: 'Thực hành', value: 'THỰC HÀNH' },
];

const SurveyScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [detailsMap, setDetailsMap] = useState({});

  // Filter state — tách riêng đúng từng param API
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [classType, setClassType] = useState('');
  const [semester, setSemester] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const fetchAllDetails = useCallback(async (groupList) => {
    const uniqueIds = [...new Set(groupList.map((g) => g.course_section_id))];
    const results = await Promise.allSettled(
      uniqueIds.map((id) =>
        axiosInstance
          .get(`/survey/teacher/course-section/${id}/statistics`)
          .then((res) => ({ id, surveys: res?.data?.data?.surveys || [] }))
          .catch(() => ({ id, surveys: [] }))
      )
    );
    const map = {};
    for (const r of results) {
      if (r.status === 'fulfilled') {
        map[r.value.id] = r.value.surveys;
      }
    }
    setDetailsMap(map);
  }, []);

  const fetchGroups = useCallback(async (isRefresh = false, overrides = {}) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    setDetailsMap({});

    // Dùng overrides để apply filter ngay lúc submit (tránh stale closure)
    const appliedCode     = overrides.courseCode  ?? courseCode;
    const appliedName     = overrides.courseName  ?? courseName;
    const appliedType     = overrides.classType   ?? classType;
    const appliedSemester = overrides.semester    ?? semester;

    try {
      const params = new URLSearchParams({ limit: 100 });
      if (appliedCode.trim())     params.append('courseCode', appliedCode.trim());
      if (appliedName.trim())     params.append('courseName', appliedName.trim());
      if (appliedType.trim())     params.append('classType',  appliedType.trim());
      if (appliedSemester.trim()) params.append('semester',   appliedSemester.trim());

      const res = await axiosInstance.get(`/survey/teacher/my-groups?${params.toString()}`);
      const list = res?.data?.data || [];
      setGroups(list);
      await fetchAllDetails(list);
    } catch (err) {
      setError(err?.response?.data?.message || 'Không thể tải danh sách khảo sát');
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [courseCode, courseName, classType, semester, fetchAllDetails]);

  const handleReset = () => {
    setCourseCode('');
    setCourseName('');
    setClassType('');
    setSemester('');
    fetchGroups(false, { courseCode: '', courseName: '', classType: '', semester: '' });
  };

  const handleApply = () => {
    fetchGroups();
  };

  const activeFilterCount = [courseCode, courseName, classType, semester].filter(Boolean).length;

  useEffect(() => {
    fetchGroups();
  }, []);

  const getDetail = (group) => {
    const surveys = detailsMap[group.course_section_id];
    if (!surveys) return null;
    return (
      surveys.find(
        (s) => (s.practice_group?.id ?? null) === (group.practice_group_id ?? null)
      ) || null
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#0171a5', '#30b2ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-4 pb-6"
        style={{ overflow: 'hidden' }}
      >
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', right: 0, bottom: 0,
            width: 100, height: 100, opacity: 0.48,
          }}
        >
          <SvgUri
            uri={audiobookSvgUri}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          />
        </View>

        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Khảo sát môn học</Text>
          <View style={{ width: 40 }} />
        </View>

        <View className="mt-2">
          <Text className="text-white/100 text-sm text-center">
            Thống kê kết quả khảo sát chất lượng giảng dạy
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchGroups(true)}
            colors={['#0171a5']}
            tintColor="#0171a5"
          />
        }
      >
        <View className="px-6 py-4">

          {/* Filter toggle row */}
          <View className="flex-row items-center mb-3" style={{ gap: 8 }}>
            {/* Mã môn — search bar chính */}
            <View className="flex-1 flex-row items-center bg-white rounded-xl border border-gray-200 px-3 py-2">
              <Ionicons name="search-outline" size={15} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-2 text-sm text-gray-700"
                placeholder="Mã môn học..."
                placeholderTextColor="#9ca3af"
                value={courseCode}
                onChangeText={setCourseCode}
                onSubmitEditing={handleApply}
                returnKeyType="search"
              />
              {courseCode.length > 0 && (
                <TouchableOpacity onPress={() => setCourseCode('')}>
                  <Ionicons name="close-circle" size={15} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter toggle button */}
            <TouchableOpacity
              onPress={() => setShowFilter((v) => !v)}
              className="rounded-xl border px-3 py-2.5 flex-row items-center"
              style={{
                backgroundColor: showFilter || activeFilterCount > 0 ? '#0171a5' : '#fff',
                borderColor: showFilter || activeFilterCount > 0 ? '#0171a5' : '#e5e7eb',
              }}
            >
              <Ionicons
                name="options-outline"
                size={16}
                color={showFilter || activeFilterCount > 0 ? '#fff' : '#6b7280'}
              />
              {activeFilterCount > 0 && (
                <Text className="text-white text-xs font-bold ml-1">{activeFilterCount}</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Filter panel mở rộng */}
          {showFilter && (
            <View className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">

              {/* Tên môn học */}
              <Text className="text-gray-600 text-xs font-semibold mb-1.5">Tên môn học</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 mb-3">
                <TextInput
                  className="flex-1 text-sm text-gray-700"
                  placeholder="Nhập tên môn học..."
                  placeholderTextColor="#9ca3af"
                  value={courseName}
                  onChangeText={setCourseName}
                  returnKeyType="done"
                />
                {courseName.length > 0 && (
                  <TouchableOpacity onPress={() => setCourseName('')}>
                    <Ionicons name="close-circle" size={15} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Hình thức học */}
              <Text className="text-gray-600 text-xs font-semibold mb-1.5">Hình thức học</Text>
              <View className="flex-row mb-3" style={{ gap: 8 }}>
                {CLASS_TYPE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => setClassType(opt.value)}
                    className="flex-1 py-2 rounded-xl border items-center"
                    style={{
                      backgroundColor: classType === opt.value ? '#0171a5' : '#f8fafc',
                      borderColor: classType === opt.value ? '#0171a5' : '#e5e7eb',
                    }}
                  >
                    <Text
                      className="text-xs font-semibold"
                      style={{ color: classType === opt.value ? '#fff' : '#6b7280' }}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Học kỳ */}
              <Text className="text-gray-600 text-xs font-semibold mb-1.5">Học kỳ</Text>
              <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 mb-4">
                <TextInput
                  className="flex-1 text-sm text-gray-700"
                  placeholder="VD: 2025-1"
                  placeholderTextColor="#9ca3af"
                  value={semester}
                  onChangeText={setSemester}
                  returnKeyType="done"
                />
                {semester.length > 0 && (
                  <TouchableOpacity onPress={() => setSemester('')}>
                    <Ionicons name="close-circle" size={15} color="#9ca3af" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Action buttons */}
              <View className="flex-row" style={{ gap: 8 }}>
                <TouchableOpacity
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 items-center"
                  onPress={handleReset}
                >
                  <Text className="text-gray-500 text-sm font-semibold">Xóa bộ lọc</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-2.5 rounded-xl items-center"
                  style={{ backgroundColor: '#0171a5' }}
                  onPress={() => { setShowFilter(false); handleApply(); }}
                >
                  <Text className="text-white text-sm font-semibold">Áp dụng</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Loading toàn trang */}
          {loading && (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color="#0171a5" />
              <Text className="text-gray-400 text-sm mt-3">Đang tải dữ liệu...</Text>
            </View>
          )}

          {/* Error */}
          {!!error && !loading && (
            <View className="bg-red-50 rounded-2xl p-4 border border-red-200 mb-3">
              <Text className="text-red-600 text-sm">{error}</Text>
              <TouchableOpacity className="mt-2" onPress={() => fetchGroups()}>
                <Text className="text-red-500 text-xs font-semibold">Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty */}
          {!loading && !error && groups.length === 0 && (
            <View className="bg-slate-50 rounded-2xl p-8 border border-slate-200 items-center">
              <Ionicons name="clipboard-outline" size={44} color="#cbd5e1" />
              <Text className="text-slate-500 text-sm mt-3 text-center">
                Chưa có nhóm giảng dạy nào hoặc chưa có khảo sát.
              </Text>
            </View>
          )}

          {/* Cards */}
          {!loading && !error && groups.map((group) => {
            const key = `${group.course_section_id}_${group.practice_group_id ?? 'LT'}`;
            return (
              <GroupCard
                key={key}
                group={group}
                detail={getDetail(group)}
              />
            );
          })}
        </View>

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SurveyScreen;
