import React, { useState, useEffect } from 'react';
import BaseHomeScreen from '../../components/BaseHomeScreen';
import TeacherScheduleCard from '../../components/TeacherScheduleCard';
import { useSelector, useDispatch } from 'react-redux';
import { getTeacherProfileThunk, getMySchedules } from '../../features/teacher/teacherThunks';
import { selectTeacherProfile, selectTeacherSchedules, selectSchedulesLoading } from '../../features/teacher/teacherSlice';

const TeacherHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const userRole = 'teacher';

  const dispatch = useDispatch();
  const profile = useSelector(selectTeacherProfile);
  const isLoading = useSelector(selectSchedulesLoading);
  const schedules = useSelector(selectTeacherSchedules);


  //thay bằng API call
  const stats = {
    attendanceRate: 78.5,
    hoursThisWeek: 18,
    studentCount: 125,
  };

  useEffect(() => {
    // Load student profile on mount
    dispatch(getTeacherProfileThunk());
    
    // Load today's schedules on mount
    dispatch(getMySchedules());
  }, [dispatch]);

  // Kiểm tra các lớp học sắp bắt đầu để tạo cảnh báo khẩn cấp
  useEffect(() => {
    const checkUrgentAlerts = () => {
      const now = new Date();
      const alerts = [];

      schedules.forEach((schedule) => {
        const [startHourNum, startMinute] = schedule.startHour.split(':').map(Number);
        const classTime = new Date();
        classTime.setHours(startHourNum, startMinute, 0, 0);
        
        const diffMs = classTime - now;
        const diffMinutes = Math.floor(diffMs / 60000);
        
        // Cảnh báo nếu lớp học đã bắt đầu và chưa tạo QR (trong vòng 5 phút sau khi bắt đầu)
        if (diffMinutes >= -5 && diffMinutes <= 0 && !schedule.hasActiveSession) {
          alerts.push({
            title: 'Chưa tạo QR điểm danh!',
            message: `${schedule.courseCode} - ${schedule.courseName} (${schedule.startHour})`,
            scheduleId: schedule.id,
          });
        }
      });

      setUrgentAlerts(alerts);
    };

    checkUrgentAlerts();
    const interval = setInterval(checkUrgentAlerts, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, [schedules]);

  const onRefresh = () => {
    setRefreshing(true);
    // Call API to refresh data
    dispatch(getTeacherProfileThunk());
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderScheduleCard = (schedule) => (
    <TeacherScheduleCard
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
      stats={stats}
      urgentAlerts={urgentAlerts}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderScheduleCard={renderScheduleCard}
      isLoading={isLoading}
    />
  );
};

export default TeacherHomeScreen;
