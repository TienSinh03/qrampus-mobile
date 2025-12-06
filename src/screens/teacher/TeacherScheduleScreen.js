import React from 'react';
import BaseScheduleScreen from '../../components/BaseScheduleScreen';
import TeacherScheduleCard from '../../components/TeacherScheduleCard';

const TeacherScheduleScreen = ({ navigation }) => {
  const userRole = 'teacher';
  // Mock data - thay bằng API call
  const scheduleData = {
    '2025-01-06': [
      {
        id: '1',
        courseName: 'Lập trình Di động',
        courseCode: 'IT4788',
        room: 'D3-201',
        startTime: '07:00',
        endTime: '09:00',
        studentCount: 45,
        hasActiveSession: false,
        courseSectionId: 101,
        practice_group_id: null,
        practice_group_name: null,
      },
      {
        id: '4',
        courseName: 'Lập trình Di động - TH Group A',
        courseCode: 'IT4788',
        room: 'D3-205',
        startTime: '13:00',
        endTime: '15:00',
        studentCount: 15,
        hasActiveSession: false,
        courseSectionId: 101,
        practice_group_id: 1,
        practice_group_name: 'Group A',
      },
    ],
    '2025-01-07': [
      {
        id: '2',
        courseName: 'Cơ sở dữ liệu',
        courseCode: 'IT3090',
        room: 'D5-302',
        startTime: '09:15',
        endTime: '11:15',
        studentCount: 38,
        hasActiveSession: false,
        courseSectionId: 102,
        practice_group_id: null,
        practice_group_name: null,
      },
      {
        id: '5',
        courseName: 'Cơ sở dữ liệu - TH Group B',
        courseCode: 'IT3090',
        room: 'D5-310',
        startTime: '15:00',
        endTime: '17:00',
        studentCount: 12,
        hasActiveSession: false,
        courseSectionId: 102,
        practice_group_id: 2,
        practice_group_name: 'Group B',
      },
    ],
    '2025-12-02': [
      {
        id: '3',
        courseName: 'Mạng máy tính',
        courseCode: 'IT4060',
        room: 'TC-209',
        startTime: '23:00',
        endTime: '23:50',
        studentCount: 42,
        hasActiveSession: false,
        courseSectionId: 103,
        practice_group_id: null,
        practice_group_name: null,
      },
    ],
  };

  return (
    <BaseScheduleScreen
      navigation={navigation}
      userRole={userRole}
      title="Lịch giảng/ lịch thi"
      scheduleData={scheduleData}
    />
  );
};

export default TeacherScheduleScreen;
