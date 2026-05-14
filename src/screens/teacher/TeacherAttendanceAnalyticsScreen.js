import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import SemesterPickerModal from '../../components/modal/SemesterPickerModal';

import { useDispatch, useSelector } from 'react-redux';
import {
  selectAttendanceDashboard,
  selectAttendanceDashboardLoading,
} from '../../features/teacher/teacherSlice';
import { getTeacherAttendanceDashboardThunk } from '../../features/teacher/teacherThunks';

const SCREEN_WIDTH = Dimensions.get('window').width;
const Y_AXIS_W = 30;
const BAR_CHART_WIDTH = SCREEN_WIDTH - 64 - Y_AXIS_W - 4;

const MONTH_SHORT = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
const DIST_COLORS = ['#16a34a', '#d97706', '#dc2626', '#2563eb'];
const DIST_LABELS = ['Đúng giờ', 'Trễ', 'Vắng mặt', 'Thủ công'];

const SectionCard = ({ title, icon, children }) => (
  <View
    className="bg-white rounded-2xl p-4 mb-3"
    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3, elevation: 2 }}
  >
    <View className="flex-row items-center mb-3">
      {icon && <Ionicons name={icon} size={15} color="#374151" style={{ marginRight: 6 }} />}
      <Text className="text-gray-800 font-bold text-sm">{title}</Text>
    </View>
    {children}
  </View>
);

//  Donut chart — Phân bổ trạng thái 
const DistributionSection = ({ onTime, late, absent, manual, rate, totalSessions }) => {
  const values = [onTime || 0, late || 0, absent || 0, manual || 0];
  const total = values.reduce((s, v) => s + v, 0);
  const rateColor = rate >= 80 ? '#16a34a' : rate >= 60 ? '#d97706' : '#dc2626';

  if (total === 0) {
    return (
      <View className="items-center py-6">
        <Ionicons name="pie-chart-outline" size={36} color="#d1d5db" />
        <Text className="text-gray-400 text-sm mt-2">Chưa có dữ liệu</Text>
      </View>
    );
  }

  const pieData = values
    .map((v, i) => ({ value: v, color: DIST_COLORS[i] }))
    .filter(d => d.value > 0);

  return (
    <View className="items-center">

      <PieChart
        donut
        data={pieData}
        radius={90}
        innerRadius={58}
        centerLabelComponent={() => (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: rateColor }}>{rate}%</Text>
            <Text style={{ fontSize: 10, color: '#6b7280' }}>đúng giờ</Text>
          </View>
        )}
      />

      <View className="flex-row items-center mt-3">
        <Ionicons name="information-circle-outline" size={16} color="#6b7280" />
        <Text className="text-gray-500 text-xs">
          {totalSessions ?? 0} buổi trong học kỳ
        </Text>
      </View>

      {/* Legend */}
      <View style={{ width: '100%', marginTop: 16, gap: 8 }}>
        {values.map((v, i) => {
          const pct = total > 0 ? Math.round((v / total) * 100) : 0;
          return (

            <View key={i} className="flex-row items-center">
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: DIST_COLORS[i], marginRight: 8 }} />
              <Text className="text-gray-600 text-xs flex-1">{DIST_LABELS[i]}</Text>
              <Text className="text-gray-400 text-xs mr-3">{v} buổi</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: v > 0 ? DIST_COLORS[i] : '#9ca3af' }}>
                {pct}%
              </Text>
            </View>

          );
        })}
      </View>
    </View>
  );
};

//Stacked Bar chart — Xu hướng theo tháng 
const MonthlyTrend = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View className="items-center py-6">
        <Ionicons name="bar-chart-outline" size={36} color="#d1d5db" />
        <Text className="text-gray-400 text-sm mt-2">Chưa có dữ liệu theo tháng</Text>
      </View>
    );
  }

  const maxTotal = Math.max(...data.map(d => d.onTime + d.late + d.absent), 1);

  // label khi dữ liệu span nhiều năm - T2/25, T9/25
  const hasMultipleYears = new Set(data.map(d => d.year)).size > 1;
  const getLabel = (item) => hasMultipleYears ? `T${item.month}/${String(item.year).slice(2)}` : `T${item.month}`;

  const stackData = data.map(item => {
    const stacks = [
      { value: item.onTime || 0, color: '#16a34a' },
      { value: item.late || 0, color: '#d97706' },
      { value: item.absent || 0, color: '#dc2626' },
    ];

    const allZero = stacks.every(s => s.value === 0);
    return {
      stacks: allZero ? [{ value: 0.01, color: '#e5e7eb' }] : stacks,
      label: getLabel(item),
    };
  });

  const labelFontSize = hasMultipleYears ? 8 : 10;

  return (
    <>
      <BarChart
        stackData={stackData}
        barWidth={26}
        spacing={10}
        barBorderTopLeftRadius={4}
        barBorderTopRightRadius={4}
        noOfSections={4}
        maxValue={Math.ceil(maxTotal * 1.3)}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#f3f4f6"
        yAxisTextStyle={{ fontSize: 10, color: '#9ca3af' }}
        xAxisLabelTextStyle={{ fontSize: labelFontSize, color: '#9ca3af' }}
        yAxisLabelWidth={Y_AXIS_W}
        width={BAR_CHART_WIDTH}
        scrollToEnd
        isAnimated
        animationDuration={500}
      />

      {/* Legend */}
      <View className="flex-row items-center justify-end mt-2" style={{ gap: 12 }}>
        {[['#16a34a', 'Đúng giờ'], ['#d97706', 'Trễ'], ['#dc2626', 'Vắng']].map(([color, label]) => (
          <View key={label} className="flex-row items-center" style={{ gap: 4 }}>
            <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: color }} />
            <Text className="text-gray-400 text-xs">{label}</Text>
          </View>
        ))}
      </View>
    </>
  );
};

// Xếp hạng môn học 

const CourseRankRow = ({ rank, item }) => {
  const rate = Math.round(item.attendanceRate ?? 0);
  const color = rate >= 80 ? '#16a34a' : rate >= 50 ? '#0284c7' : '#f97316';
  const isPractice = !!item.practiceGroupName;
  const medalColors = ['#f59e0b', '#9ca3af', '#b45309'];

  return (
    <View className={`py-2.5 ${rank > 1 ? 'border-t border-gray-50' : ''}`}>
      <View className="flex-row items-center mb-1.5">
        <View style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: rank <= 3 ? medalColors[rank - 1] : '#f3f4f6',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 10,
        }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: rank <= 3 ? 'white' : '#9ca3af' }}>
            {rank}
          </Text>
        </View>

        <View className="flex-1">
          <Text className="text-gray-800 font-semibold text-sm" numberOfLines={1}>
            {item.courseName || '—'}
          </Text>
          <Text className="text-gray-400 text-xs">
            {item.courseCode}{isPractice ? ` · ${item.practiceGroupName}` : ''}
          </Text>
        </View>
        <Text style={{ fontSize: 15, fontWeight: '800', color }}>{rate}%</Text>
      </View>

      <View style={{ marginLeft: 32, height: 5, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ width: `${rate}%`, height: 5, borderRadius: 3, backgroundColor: color }} />
      </View>
    </View>
  );
};

// main  
const TeacherAttendanceAnalyticsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const dashboard = useSelector(selectAttendanceDashboard);
  const isLoading = useSelector(selectAttendanceDashboardLoading);

  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback((semester) => {
    dispatch(getTeacherAttendanceDashboardThunk(semester ? { semester } : {}));
  }, [dispatch]);

  useEffect(() => {
    if (!dashboard) fetch();
  }, []);

  useEffect(() => {
    if (dashboard?.availableSemesters?.length > 0 && selectedSemester === null) {
      const firstSem = dashboard.availableSemesters[0];
      setSelectedSemester(firstSem);
      fetch(firstSem);
    }
  }, [dashboard]);

  const onSemesterSelect = (sem) => {
    setSelectedSemester(sem);
    setShowPicker(false);
    fetch(sem);
  };

  const summary = dashboard?.summary ?? {};
  const semesters = dashboard?.availableSemesters ?? [];

  const courseProgress = useMemo(() => {
    const list = dashboard?.courseProgress ?? [];

    return selectedSemester ? list.filter(c => c.semester === selectedSemester) : list;
  }, [dashboard, selectedSemester]);

  const rankedCourses = useMemo(
    () => [...courseProgress].sort((a, b) => (b.attendanceRate ?? 0) - (a.attendanceRate ?? 0)),
    [courseProgress]
  );

  const monthlyData = dashboard?.monthlyBreakdown ?? [];
  const rate = Math.round(summary.attendanceRate ?? 0);

  const handleRefresh = () => {
    setRefreshing(true);
    fetch(selectedSemester);
    setRefreshing(false);
  };

  const HeaderBar = (
    <LinearGradient
      colors={['#0171a5', '#30b2ea']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="px-5 pt-4 pb-5"
    >
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-white text-xl font-bold">Báo cáo & Phân tích</Text>
          <Text className="text-white/70 text-xs">Thống kê chấm công chi tiết</Text>
        </View>

        {isLoading && <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />}
      </View>
    </LinearGradient>
  );

  if (isLoading && !dashboard) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar style="light" />
        {HeaderBar}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0171a5" />
          <Text className="text-gray-400 text-sm mt-3">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      {HeaderBar}

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={ <RefreshControl refreshing={refreshing} onRefresh={handleRefresh}/> }
      >
        {/* Semester picker */}
        {semesters.length > 0 && (
          <TouchableOpacity
            onPress={() => setShowPicker(true)}
            className="flex-row items-center self-start mb-4"
            activeOpacity={0.7}
          >
            <Ionicons name="school-outline" size={15} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1.5 mr-1">Học kỳ:</Text>
            <Text className="text-sky-600 text-sm font-bold mr-1">{selectedSemester ?? '—'}</Text>
            <Ionicons name="chevron-down" size={14} color="#0284c7" />
          </TouchableOpacity>
        )}

        {/* Phân bổ trạng thái */}
        <SectionCard title="Phân bổ trạng thái" icon="pie-chart-outline">
          <DistributionSection
            onTime={summary.onTimeCheckins}
            late={summary.lateCheckins}
            absent={summary.absentCheckins}
            manual={summary.manualOverrideCheckins}
            rate={rate}
            totalSessions={summary.totalTeachingSessions}
          />
        </SectionCard>

        {/*Xu hướng theo tháng */}
        <SectionCard title="Xu hướng theo tháng" icon="bar-chart-outline">
          <MonthlyTrend data={monthlyData} />
        </SectionCard>

        {/*Xếp hạng môn học */}
        <SectionCard title="Xếp hạng môn học" icon="trophy-outline">
          {rankedCourses.length === 0 ? (
            <View className="items-center py-4">
              <Ionicons name="school-outline" size={36} color="#d1d5db" />
              <Text className="text-gray-400 text-sm mt-2">Không có dữ liệu</Text>
            </View>
          ) : (
            rankedCourses.map((item, idx) => (
              <CourseRankRow
                key={`${item.courseSectionId}-${item.practiceGroupId ?? 'theory'}`}
                rank={idx + 1}
                item={item}
              />
            ))
          )}
        </SectionCard>
      </ScrollView>

      {/* Semester picker modal */}
      <SemesterPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        semesters={semesters}
        onSemesterSelect={onSemesterSelect}
        selectedSemester={selectedSemester}
      />
      
    </SafeAreaView>
  );
};

export default TeacherAttendanceAnalyticsScreen;
