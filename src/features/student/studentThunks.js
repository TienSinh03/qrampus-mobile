import { instance } from "../../api/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { transformCourseToUI } from "../../utils/course.helper";

/**
 * Transform schedule từ API sang format UI
 */
export const transformScheduleToUI = (schedule) => {
    return {
        id: schedule.sessionId,
        sessionId: schedule.sessionId,
        enrollmentId: schedule.enrollmentId,
        enrollmentStatus: schedule.enrollmentStatus,
        classDate: schedule.classDate,
        dayOfWeek: schedule.dayOfWeek,
        startHour: schedule.startHour?.slice(0, 5) || '', // "07:30:00" -> "07:30"
        endHour: schedule.endHour?.slice(0, 5) || '',
        scheduleType: schedule.scheduleType, // 'theory' | 'practice'
        sessionStatus: schedule.sessionStatus,
        // Course info
        courseName: schedule.courseSection?.courseName || '',
        courseCode: schedule.courseSection?.courseCode || '',
        credits: schedule.courseSection?.credits || 0,
        semester: schedule.courseSection?.semester || '',
        courseDescription: schedule.courseSection?.description || '',
        courseSectionId: schedule.courseSection?.courseSectionId || '',
        // Teacher info
        teacherName: schedule.teacher?.teacherName || '',
        teacherId: schedule.teacher?.teacherId || '',
        teacherCode: schedule.teacher?.teacherCode || '',
        teacherDepartment: schedule.teacher?.department || '',
        teacherPhone: schedule.teacher?.phone || '',
        teacherEmail: schedule.teacher?.email || '',
        // Room info
        room: schedule.room?.roomCode || schedule.room?.roomName || '',
        roomId: schedule.room?.roomId || '',
        roomName: schedule.room?.roomName || '',
        roomCoordinates: schedule.room?.coordinates || [],
        roomDescription: schedule.room?.description || '',
        // Practice group
        practiceGroup: schedule.practiceGroup,
        // UI helpers
        isTheory: schedule.scheduleType === 'theory',
        isPractice: schedule.scheduleType === 'practice',
    };
};

export const getStudentProfileThunk = createAsyncThunk(
    'student/profile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await instance.get('/students/profile');
            return response?.data?.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lấy thông tin sinh viên thất bại');
        }
    }
);                                                                    

/**
 * Lấy lịch học của sinh viên
 * @param {Object} params - { startDate, endDate, semester?, status?, classDate? }
 */
export const getStudentSchedulesThunk = createAsyncThunk(
    'student/schedules',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { startDate, endDate, semester, status, classDate } = params;
            
            // Build query params
            const queryParams = new URLSearchParams();
            if (startDate) queryParams.append('startDate', startDate);
            if (endDate) queryParams.append('endDate', endDate);
            if (semester) queryParams.append('semester', semester);
            if (status) queryParams.append('status', status);
            if (classDate) queryParams.append('classDate', classDate);

            const queryString = queryParams.toString();
            const url = `/students/me/schedules${queryString ? `?${queryString}` : ''}`;
            
            const response = await instance.get(url);
            
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy lịch học thất bại');
            }

            const rawSchedules = response?.data?.data?.schedules || [];
            const schedules = rawSchedules.map(transformScheduleToUI);
            
            return {
                schedules,
                totalSchedules: response?.data?.data?.totalSchedules || 0,
                params: { startDate, endDate }, // Lưu lại params để biết đang fetch range nào
            };
        } catch (error) {
            // console.error('Error fetching schedules:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Lấy lịch học thất bại');
        }
    }
);

/**
 * Lấy lịch học cá nhân cho ngày hiện tại
 */
export const getMySchedulesToday = createAsyncThunk(
    'student/mySchedulesToday',
    async (_, { rejectWithValue }) => {
        try {
            const response = await instance.get('/students/me/schedules/today')

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy lịch học cá nhân thất bại');
            }
            const rawSchedules = response?.data?.data?.schedules || [];
            const schedules = rawSchedules.map(transformScheduleToUI);

            return {
                schedules,
                totalSchedules: response?.data?.data?.totalSchedules || 0,
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Lấy lịch học cá nhân thất bại');
        }
    }
);

/**
 * Lấy danh sách khóa học của sinh viên
 * @param {Object} params - { semester?, status? }
 */
export const getStudentCoursesThunk = createAsyncThunk(
    'student/courses',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { semester, status } = params;
            
            // Build query params
            const queryParams = new URLSearchParams();
            if (semester) queryParams.append('semester', semester);
            if (status) queryParams.append('status', status);

            const queryString = queryParams.toString();
            const url = `/students/me/courses${queryString ? `?${queryString}` : ''}`;
            
            const response = await instance.get(url);
            
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

/**
 * Update student profile
 * @param {Object} profileData - { full_name, dob, class_name, major, phone, email }
 */
export const updateStudentProfileThunk = createAsyncThunk(
    'student/updateProfile',
    async (profileData, { rejectWithValue }) => {
        try {
            const response = await instance.put('/students/me', profileData);
            
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Cập nhật thông tin thất bại');
            }
            
            return response?.data?.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Cập nhật thông tin thất bại');
        }
    }
);