import React, { useState, useEffect, useCallback } from 'react';
import BaseHomeScreen from '../../components/BaseHomeScreen';
import ScheduleCard from '../../components/ScheduleCard';
import { useSelector, useDispatch } from 'react-redux';
import { getStudentProfileThunk, getMySchedulesToday } from '../../features/student/studentThunks';
import { selectStudentProfile, selectSchedulesLoading, selectStudentSchedulesToday } from '../../features/student/studentSlice';
const StudentHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const userRole = 'student';

  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);
  const isLoading = useSelector(selectSchedulesLoading);
  const schedules = useSelector(selectStudentSchedulesToday);

  useEffect(() => {
    // Load student profile on mount
    dispatch(getStudentProfileThunk());

    // Load today's schedules on mount
    dispatch(getMySchedulesToday());
  }, [dispatch]);


  const onRefresh = () => {
    setRefreshing(true);
    dispatch(getMySchedulesToday());
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderScheduleCard = (schedule) => (
    <ScheduleCard
      key={schedule.id}
      schedule={schedule}
      navigation={navigation}
    />
  );

  return (
    <BaseHomeScreen
      navigation={navigation}
      userRole={userRole}
      userData={profile}
      todaySchedules={schedules}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderScheduleCard={renderScheduleCard}
      isLoading={isLoading}
    />
  );
};

export default StudentHomeScreen;
