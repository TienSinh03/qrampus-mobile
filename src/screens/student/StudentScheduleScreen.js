import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BaseScheduleScreen from '../../components/BaseScheduleScreen';
import { getStudentSchedulesThunk } from '../../features/student/studentThunks';
import {
  selectSchedulesByDate,
  selectSchedulesLoading,
  selectSchedulesError,
  selectCurrentScheduleRange,
} from '../../features/student/studentSlice';

/**
 * Tính toán date range theo view mode
 */
const getDateRange = (baseDate, mode) => {
  const date = new Date(baseDate);
  console.log('Calculating date range for date:', baseDate, 'mode:', mode);
  
  if (mode === 'month') {
    // Lấy ngày đầu và cuối tháng
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    };
  } else if (mode === 'week') {
    // Lấy ngày đầu (Thứ 2) và cuối (Chủ nhật) của tuần
    const dayOfWeek = date.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0],
    };
  } else {
    // Day mode - chỉ lấy ngày đó (hoặc cả tuần để có context)
    const monday = new Date(date);
    console.log('Calculating day mode range for date:', date.toISOString().split('T')[0]);
    const dayOfWeek = date.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(date.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    console.log('Day mode range:', monday.toISOString().split('T')[0], 'to', sunday.toISOString().split('T')[0]);
    return {
      startDate: monday.toISOString().split('T')[0],
      endDate: sunday.toISOString().split('T')[0],
    };
  }
};

/**
 * Kiểm tra xem date có nằm trong range đã fetch không
 */
const isDateInRange = (date, range) => {
  if (!range || !range.startDate || !range.endDate) return false;
  return date >= range.startDate && date <= range.endDate;
};

const StudentScheduleScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const userRole = 'student';

  // Redux selectors
  const schedulesByDate = useSelector(selectSchedulesByDate);
  const isLoading = useSelector(selectSchedulesLoading);
  const error = useSelector(selectSchedulesError);
  const currentRange = useSelector(selectCurrentScheduleRange);

  // Local state để track date/month hiện tại
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('month');

  /**
   * Fetch schedules khi cần
   */
  const fetchSchedules = useCallback((date, mode) => {
    const { startDate, endDate } = getDateRange(date, mode);

    // Chỉ fetch nếu range mới không nằm trong range đã fetch
    const needsFetch = !currentRange || 
      startDate < currentRange.startDate || 
      endDate > currentRange.endDate;

    if (needsFetch) {
      dispatch(getStudentSchedulesThunk({ startDate, endDate }));
    }
  }, [dispatch, currentRange]);

  // Fetch data khi component mount hoặc khi thay đổi tháng/tuần
  useEffect(() => {
    fetchSchedules(currentDate, viewMode);
  }, [currentDate, viewMode, fetchSchedules]);

  /**
   * Handler khi thay đổi tháng
   */
  const handleMonthChange = useCallback((newMonth) => {
    setCurrentDate(newMonth);
    fetchSchedules(newMonth, viewMode);
  }, [fetchSchedules, viewMode]);

  /**
   * Handler khi thay đổi view mode
   */
  const handleViewModeChange = useCallback((newMode) => {
    setViewMode(newMode);
    fetchSchedules(currentDate, newMode);
  }, [fetchSchedules, currentDate]);

  /**
   * Handler khi user chọn date mới (click vào ngày trên calendar)
   */
  const handleDateSelect = useCallback((newDate) => {
    setCurrentDate(newDate);
  }, []);

  /**
   * Handler refresh
   */
  const handleRefresh = useCallback((callback) => {
    const { startDate, endDate } = getDateRange(currentDate, viewMode);
    dispatch(getStudentSchedulesThunk({ startDate, endDate }))
      .finally(() => {
        if (callback) callback();
      });
  }, [dispatch, currentDate, viewMode]);

  return (
    <BaseScheduleScreen
      navigation={navigation}
      userRole={userRole}
      title="Lịch học/ lịch thi"
      scheduleData={schedulesByDate}
      currentDate={currentDate}
      currentViewMode={viewMode} 
      isLoading={isLoading}
      error={error}
      onRefresh={handleRefresh}
      onMonthChange={handleMonthChange}
      onViewModeChange={handleViewModeChange}
      onDateSelect={handleDateSelect}
    />
  );
};

export default StudentScheduleScreen;
