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

import { getDateRange } from '../../utils/date.helper';

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
