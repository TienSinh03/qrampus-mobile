import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Svg, { Circle, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { getAttendanceHistoryThunk } from '../../features/student/attendanceHistoryThunks';
import {
  selectAttendanceHistoryLoading,
  selectAttendanceSummary,
  selectAvailableSemesters,
} from '../../features/student/attendanceHistorySlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 16;
const CHART_WIDTH = SCREEN_WIDTH - 48 - CARD_PADDING * 2; // px-6*2 + card padding*2

const STATUS_OPTIONS = [
  { value: null, label: 'Tất cả', color: '#6b7280' },
  { value: 'present', label: 'Có mặt', color: '#10b981' },
  { value: 'absent', label: 'Vắng', color: '#ef4444' },
  { value: 'excused', label: 'Có phép', color: '#f59e0b' },
];

const LEGEND_ITEMS = [
  { color: '#10b981', label: 'Có mặt', key: 'presentCount' },
  { color: '#ef4444', label: 'Vắng', key: 'absentCount' },
  { color: '#f59e0b', label: 'Có phép', key: 'excusedCount' },
];

const compareSemesterValues = (left, right) => {
  const leftText = String(left ?? '').trim();
  const rightText = String(right ?? '').trim();

  const leftNumbers = leftText.match(/\d+/g)?.map(Number) || [];
  const rightNumbers = rightText.match(/\d+/g)?.map(Number) || [];
  const length = Math.max(leftNumbers.length, rightNumbers.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (leftNumbers[index] ?? -1) - (rightNumbers[index] ?? -1);
    if (difference !== 0) {
      return difference;
    }
  }

  return leftText.localeCompare(rightText);
};

const getLatestSemester = (semesters = []) => {
  const sortedSemesters = semesters.filter(Boolean).slice().sort(compareSemesterValues);
  return sortedSemesters.length > 0 ? sortedSemesters[sortedSemesters.length - 1] : null;
};

// ─── Donut Chart ────────────────────────────────────────────────────────────

const polarToCartesian = (cx, cy, r, angleRad) => ({
  x: cx + r * Math.sin(angleRad),
  y: cy - r * Math.cos(angleRad),
});

const DonutChart = ({ present, absent, excused, total, size = 150 }) => {
  const strokeWidth = 26;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const rate = total > 0 ? Math.round((present / total) * 100) : 0;

  const segments = [
    { value: present, color: '#10b981' },
    { value: absent, color: '#ef4444' },
    { value: excused, color: '#f59e0b' },
  ].filter(s => s.value > 0);

  let cumulativeAngle = 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        {/* background track */}
        <Circle cx={cx} cy={cy} r={r} stroke="#f3f4f6" strokeWidth={strokeWidth} fill="none" />

        {total === 0
          ? null
          : segments.length === 1
            ? (
              // Full circle single segment
              <Circle cx={cx} cy={cy} r={r} stroke={segments[0].color} strokeWidth={strokeWidth} fill="none" />
            )
            : segments.map((seg, i) => {
                const startAngle = cumulativeAngle;
                const sweepAngle = (seg.value / total) * 2 * Math.PI;
                cumulativeAngle += sweepAngle;

                const gapAngle = 0.04; // small gap between segments in radians
                const start = polarToCartesian(cx, cy, r, startAngle + gapAngle / 2);
                const end = polarToCartesian(cx, cy, r, startAngle + sweepAngle - gapAngle / 2);
                const largeArc = sweepAngle > Math.PI ? 1 : 0;
                const d = `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;

                return (
                  <Path
                    key={i}
                    d={d}
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="butt"
                  />
                );
              })
        }
      </Svg>

      {/* Center label */}
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.donutRate}>{rate}%</Text>
        <Text style={styles.donutLabel}>Có mặt</Text>
      </View>
    </View>
  );
};

// ─── Bar Chart ──────────────────────────────────────────────────────────────

const BAR_CHART_HEIGHT = 90;
const BAR_LABELS = [
  { key: 'present', label: 'Có mặt', color: '#10b981', bg: '#d1fae5' },
  { key: 'absent', label: 'Vắng', color: '#ef4444', bg: '#fee2e2' },
  { key: 'excused', label: 'Có phép', color: '#f59e0b', bg: '#fef3c7' },
];

const BarChart = ({ present, absent, excused, width }) => {
  const values = { present, absent, excused };
  const maxVal = Math.max(present, absent, excused, 1);
  const barGroupWidth = (width - 24) / 3; // 24 = total gap between bars
  const barWidth = barGroupWidth * 0.55;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: BAR_CHART_HEIGHT + 46 }}>
      {BAR_LABELS.map((bar, i) => {
        const val = values[bar.key];
        const barHeight = Math.max((val / maxVal) * BAR_CHART_HEIGHT, val > 0 ? 6 : 0);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={[styles.barCount, { color: bar.color }]}>{val}</Text>
            <View style={{ width: barWidth, height: BAR_CHART_HEIGHT, justifyContent: 'flex-end' }}>
              <View
                style={{
                  width: barWidth,
                  height: barHeight,
                  backgroundColor: bar.color,
                  borderRadius: 6,
                  borderTopLeftRadius: 6,
                  borderTopRightRadius: 6,
                }}
              />
            </View>
            <View style={{ height: 1, backgroundColor: '#e5e7eb', width: '120%', marginTop: 2 }} />
            <Text style={styles.barLabel}>{bar.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── Main Widget ─────────────────────────────────────────────────────────────

const HomeAttendanceWidget = ({ navigation }) => {
  const dispatch = useDispatch();
  const summary = useSelector(selectAttendanceSummary);
  const availableSemesters = useSelector(selectAvailableSemesters);
  const isLoading = useSelector(selectAttendanceHistoryLoading);

  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const semesterInitialized = useRef(false);

  const fetchData = useCallback(
    (semester, status) => {
      dispatch(
        getAttendanceHistoryThunk({
          semester: semester ?? undefined,
          status: status ?? undefined,
          page: 1,
          limit: 20,
        }),
      );
    },
    [dispatch],
  );

  // Initial load (all semesters)
  useEffect(() => {
    fetchData(null, null);
  }, [fetchData]);

  // Auto-select latest semester once list arrives
  useEffect(() => {
    if (availableSemesters.length > 0 && !semesterInitialized.current) {
      semesterInitialized.current = true;
      const latest = getLatestSemester(availableSemesters);
      setSelectedSemester(latest);
      fetchData(latest, selectedStatus);
    }
  }, [availableSemesters, fetchData, selectedStatus]);

  const handleSemesterChange = (sem) => {
    if (sem === selectedSemester) return;
    setSelectedSemester(sem);
    fetchData(sem, selectedStatus);
  };

  const handleStatusChange = (status) => {
    if (status === selectedStatus) return;
    setSelectedStatus(status);
    fetchData(selectedSemester, status);
  };

  const { presentCount, absentCount, excusedCount, totalSessions, attendanceRate } = summary;

  return (
    <View style={styles.card}>
      {/* ── Semester chips ── */}
      <Text style={styles.filterLabel}>Học kỳ</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 12 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {availableSemesters.map(sem => (
          <TouchableOpacity
            key={sem}
            onPress={() => handleSemesterChange(sem)}
            style={[
              styles.chip,
              selectedSemester === sem ? styles.chipActive : styles.chipInactive,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                { color: selectedSemester === sem ? '#fff' : '#6b7280' },
              ]}
            >
              HK {sem}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Status chips ── */}
      <Text style={styles.filterLabel}>Trạng thái</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {STATUS_OPTIONS.map(opt => {
          const active = selectedStatus === opt.value;
          return (
            <TouchableOpacity
              key={String(opt.value)}
              onPress={() => handleStatusChange(opt.value)}
              style={[styles.chip, active ? { backgroundColor: opt.color } : styles.chipInactive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, { color: active ? '#fff' : '#6b7280' }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Content ── */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : totalSessions === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={40} color="#d1d5db" />
          <Text style={styles.emptyText}>Không có dữ liệu điểm danh</Text>
        </View>
      ) : (
        <>
          {/* ── Donut + legend ── */}
          <View style={styles.chartRow}>
            <DonutChart
              present={presentCount}
              absent={absentCount}
              excused={excusedCount}
              total={totalSessions}
              size={148}
            />

            <View style={styles.legend}>
              {LEGEND_ITEMS.map(item => (
                <View key={item.key} style={styles.legendRow}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                  <Text style={styles.legendValue}>{summary[item.key]}</Text>
                </View>
              ))}
              <View style={styles.legendDivider} />
              <View style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: '#6b7280' }]} />
                <Text style={styles.legendLabel}>Tổng buổi</Text>
                <Text style={styles.legendValue}>{totalSessions}</Text>
              </View>
            </View>
          </View>

          {/* ── Bar chart ── */}
          <Text style={[styles.filterLabel, { marginTop: 16, marginBottom: 8 }]}>So sánh</Text>
          <BarChart
            present={presentCount}
            absent={absentCount}
            excused={excusedCount}
            width={CHART_WIDTH}
          />

          {/* ── Low attendance warning ── */}
          {attendanceRate < 80 && (
            <View style={styles.warning}>
              <Ionicons name="warning" size={18} color="#d97706" />
              <Text style={styles.warningText}>
                Tỷ lệ điểm danh {attendanceRate}% đang dưới 80%. Hãy chú ý tham gia đầy đủ!
              </Text>
            </View>
          )}
        </>
      )}

      {/* ── View detail ── */}
      <TouchableOpacity
        onPress={() => navigation?.navigate('AttendanceHistory')}
        style={styles.detailBtn}
        activeOpacity={0.8}
      >
        <Ionicons name="time-outline" size={15} color="#2563eb" />
        <Text style={styles.detailBtnText}>Xem lịch sử chi tiết</Text>
        <Ionicons name="chevron-forward" size={15} color="#2563eb" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: CARD_PADDING,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.08,
    shadowRadius: 8,
    // elevation: 3,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#2563eb',
  },
  chipInactive: {
    backgroundColor: '#f3f4f6',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 10,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legend: {
    flex: 1,
    paddingLeft: 16,
    gap: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12,
    color: '#6b7280',
  },
  legendValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  legendDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 2,
  },
  donutRate: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  donutLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  barCount: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 6,
    textAlign: 'center',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    paddingVertical: 10,
    marginTop: 16,
    gap: 6,
  },
  detailBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
});

export default HomeAttendanceWidget;
