import React, { useState, useEffect } from 'react';
import BaseHomeScreen from '../../components/BaseHomeScreen';
import TeacherScheduleCard from '../../components/TeacherScheduleCard';

const TeacherHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const userRole = 'teacher';
  // thay bằng API call
  const [todaySchedules, setTodaySchedules] = useState([
    {
      id: '1',
      courseName: 'Lập trình Di động',
      courseCode: 'IT4788',
      room: 'D3-201',
      startTime: '11:15',
      endTime: '18:00',
      studentCount: 45,
      hasActiveSession: false,
      courseSectionId: 101,
      practice_group_id: null, // Lịch lý thuyết
      practice_group_name: null,
    },
    {
      id: '2',
      courseName: 'Cơ sở dữ liệu - Thực hành',
      courseCode: 'IT3090',
      room: 'D5-302',
      startTime: '13:00',
      endTime: '15:00',
      studentCount: 15,
      hasActiveSession: false,
      courseSectionId: 102,
      practice_group_id: 1, // Group A
      practice_group_name: 'Group A',
    },
    {
      id: '3',
      courseName: 'Mạng máy tính',
      courseCode: 'IT4060',
      room: 'TC-209',
      startTime: '23:08',
      endTime: '23:50',
      studentCount: 42,
      hasActiveSession: false,
      courseSectionId: 103,
      practice_group_id: null, // Lịch lý thuyết
      practice_group_name: null,
    },
  ]);

  const userData = {
    name: 'Thầy Nguyễn Văn A',
    avatarUri: null,
  };

  //thay bằng API call
  const stats = {
    attendanceRate: 78.5,
    hoursThisWeek: 18,
    studentCount: 125,
  };

  // Kiểm tra các lớp học sắp bắt đầu để tạo cảnh báo khẩn cấp
  useEffect(() => {
    const checkUrgentAlerts = () => {
      const now = new Date();
      const alerts = [];

      todaySchedules.forEach((schedule) => {
        const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
        const classTime = new Date();
        classTime.setHours(startHour, startMinute, 0, 0);
        
        const diffMs = classTime - now;
        const diffMinutes = Math.floor(diffMs / 60000);
        
        // Cảnh báo nếu lớp học đã bắt đầu và chưa tạo QR (trong vòng 5 phút sau khi bắt đầu)
        if (diffMinutes >= -5 && diffMinutes <= 0 && !schedule.hasActiveSession) {
          alerts.push({
            title: 'Chưa tạo QR điểm danh!',
            message: `${schedule.courseCode} - ${schedule.courseName} (${schedule.startTime})`,
            scheduleId: schedule.id,
          });
        }
      });

      setUrgentAlerts(alerts);
    };

    checkUrgentAlerts();
    const interval = setInterval(checkUrgentAlerts, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, [todaySchedules]);

  const onRefresh = () => {
    setRefreshing(true);
    // Call API to refresh data
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
      userData={userData}
      todaySchedules={todaySchedules}
      stats={stats}
      urgentAlerts={urgentAlerts}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderScheduleCard={renderScheduleCard}
    />
  );
};

export default TeacherHomeScreen;
