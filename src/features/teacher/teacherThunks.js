import { setAccessToken, clearToken, instance } from "../../api/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { transformCourseToUI } from "../../utils/course.helper";

/**
 * Transform schedule từ API sang format UI
 */
export const transformScheduleToUI = (schedule) => {
    return {
        id: schedule.id,
        classDate: schedule.class_date,
        dayOfWeek: schedule.day_of_week,
        startHour: schedule.start_hour?.slice(0, 5) || '', // "07:30:00" -> "07:30"
        endHour: schedule.end_hour?.slice(0, 5) || '',
        scheduleType: schedule.schedule_type, // 'theory' | 'practice'
        sessionNumber: schedule.session_number,
        // Course info
        courseName: schedule.courseSection?.name || '',
        courseCode: schedule.courseSection?.code || '',
        credits: schedule.courseSection?.credits || 0,
        semester: schedule.courseSection?.semester || '',
        courseDescription: schedule.courseSection?.description || '',
        courseSectionId: schedule.courseSection?.id || '',
        // Teacher info
        teacherName: schedule.teacher?.full_name || '',
        teacherId: schedule.teacher?.id || '',
        teacherDepartment: schedule.teacher?.department || '',
        teacherPhone: schedule.teacher?.phone || '',
        teacherEmail: schedule.teacher?.email || '',
        // Room info
        room: schedule.room?.room_code || schedule.room?.room_name || '',
        roomId: schedule.room?.id || '',
        roomName: schedule.room?.room_name || '',
        roomCoordinates: schedule.room?.coordinates || [],
        // Practice group
        practiceGroup: schedule.practiceGroup,
        // UI helpers
        isTheory: schedule.schedule_type === 'theory',
        isPractice: schedule.schedule_type === 'practice',
    };
};

export const getTeacherProfileThunk = createAsyncThunk(
    'teacher/profile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await instance.get('/personnels/profile');
            console.log('Fetched teacher profile:', response?.data);
            return response?.data?.data;
        } catch (error) {
            return rejectWithValue(error.response?.message || { message: 'Lấy thông tin giảng viên thất bại' });
        }
    }
)

/**
 * Lấy lịch giảng dạy của giảng viên
 * @param {Object} params - { semester?, startDate, endDate, classDate? }
 */
export const getTeacherSchedulesThunk = createAsyncThunk(
    'teacher/schedule',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { semester, startDate, endDate, classDate } = params;
            // Build query params
            const queryParams = new URLSearchParams();
            if (semester) queryParams.append('semester', semester);
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            if (classDate) queryParams.append('classDate', classDate);

            const queryString = queryParams.toString();
            const url = `/teacher/me/schedule${queryString ? `?${queryString}` : ''}`;

            const response = await instance.get(url);
            
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy lịch giảng dạy thất bại');
            }
            const rawSchedules = response?.data?.data?.schedules || [];
            const schedules = rawSchedules.map(transformScheduleToUI);

            return {
                schedules,
                params: { semester, startDate, endDate, classDate }
            }
        } catch (error) {
            // console.error('Error fetching schedules:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Lấy lịch học thất bại');
        }
    }
);

/**
 * Lấy lịch giảng dạy cá nhân cho ngày hiện tại
 */
export const getMySchedules = createAsyncThunk(
    'teacher/mySchedules',
    async (_, { rejectWithValue }) => {
        try {
            const response = await instance.get('/teacher/me/schedule/today');
            console.log('Fetched teacher today schedules:', response?.data);
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy lịch giảng dạy hôm nay thất bại');
            }
            const rawSchedules = response?.data?.data?.schedules || [];
            const schedules = rawSchedules.map(transformScheduleToUI);
            return {
                schedules
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Lấy lịch giảng dạy hôm nay thất bại');
        }
    }
);


/**
 * Lấy danh sách khóa học của giảng viên
 * @param {Object} params - { semester?, status? }
 */
export const getTeacherCoursesThunk = createAsyncThunk(
    'teacher/courses',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { semester, status } = params;
            
            // Build query params
            const queryParams = new URLSearchParams();
            if (semester) queryParams.append('semester', semester);
            if (status) queryParams.append('status', status);

            const queryString = queryParams.toString();
            const url = `/teacher/me/courses${queryString ? `?${queryString}` : ''}`;
            
            const response = await instance.get(url);
            console.log('Fetched teacher courses:', response?.data);
            
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy danh sách khóa học thất bại');
            }

            const rawCourses = response?.data?.data?.courses || response?.data?.data || [];
            const courses = rawCourses.map(transformCourseToUI);

            return {
                courses,
                totalCourses: response?.data?.data?.totalCourses || courses.length,
            };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Lấy danh sách khóa học thất bại');
        }
    }
);

// lấy danh sách phiên chụp ảnh của giảng viên với phân trang
