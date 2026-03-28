import { instance } from "../../api/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";

/**
 * Transform attendance record từ API sang format UI
 */
export const transformAttendanceRecord = (record) => {
  return {
    // Class session info
    classSession: record.classSession || {},
    classSessionId: record.classSession?.id,
    sessionNumber: record.classSession?.sessionNumber,
    classDate: record.classSession?.classDate,
    startHour: record.classSession?.startHour?.slice(0, 5) || '',
    endHour: record.classSession?.endHour?.slice(0, 5) || '',
    scheduleType: record.classSession?.scheduleType,
    sessionStatus: record.classSession?.status,
    isMakeupClass: record.classSession?.isMakeupClass || false,
    
    // Course info
    courseId: record.course?.id,
    courseCode: record.course?.code,
    courseName: record.course?.name,
    credits: record.course?.credits,
    semester: record.course?.semester,
    
    // Room info
    roomId: record.room?.id,
    roomCode: record.room?.code,
    roomName: record.room?.name,
    
    // Teacher info
    teacherId: record.teacher?.id,
    teacherCode: record.teacher?.code,
    teacherName: record.teacher?.fullName,
    
    // Practice group
    practiceGroup: record.practiceGroup ? {
      id: record.practiceGroup.id,
      groupName: record.practiceGroup.groupName,
      numberGroup: record.practiceGroup.numberGroup,
    } : null,
    
    // Attendance info
    attendanceStatus: record.attendance?.status,
    scanTime: record.attendance?.scanTime,
    leaveRequest: record.attendance?.leaveRequest,
  };
};

/**
 * Lấy lịch sử điểm danh cá nhân của sinh viên
 */
export const getAttendanceHistoryThunk = createAsyncThunk(
  'student/attendanceHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      const {
        semester,
        courseSectionId,
        status,
        fromDate,
        toDate,
        page = 1,
        limit = 20,
      } = params;

      // Build query params
      const queryParams = new URLSearchParams();
      if (semester) queryParams.append('semester', semester);
      if (courseSectionId) queryParams.append('course_section_id', courseSectionId);
      if (status) queryParams.append('status', status);
      if (fromDate) queryParams.append('from_date', fromDate);
      if (toDate) queryParams.append('to_date', toDate);
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const queryString = queryParams.toString();
      const url = `/attendance-history/me${queryString ? `?${queryString}` : ''}`;

      const response = await instance.get(url);

      if (!response?.data?.success) {
        throw new Error(response?.data?.message || 'Lấy lịch sử điểm danh thất bại');
      }

      const data = response?.data?.data;
      
      // Transform records
      const records = (data?.records || []).map(transformAttendanceRecord);

      return {
        student: data?.student || null,
        summary: data?.summary || {
          totalSessions: 0,
          presentCount: 0,
          absentCount: 0,
          excusedCount: 0,
          attendanceRate: 0,
        },
        filters: data?.filters || {},
        pagination: data?.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
        records,
        availableSemesters: data?.availableSemesters || [],
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Lấy lịch sử điểm danh thất bại'
      );
    }
  }
);
