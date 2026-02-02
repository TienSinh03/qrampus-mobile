import { instance } from "../../api/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getStudentProfileThunk = createAsyncThunk(
    'student/profile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await instance.get('/students/profile');
            console.log('Fetched student profile:', response?.data);
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

            return {
                schedules: response?.data?.data?.schedules || [],
                totalSchedules: response?.data?.data?.totalSchedules || 0,
                params: { startDate, endDate }, // Lưu lại params để biết đang fetch range nào
            };
        } catch (error) {
            // console.error('Error fetching schedules:', error);
            return rejectWithValue(error.response?.data?.message || error.message || 'Lấy lịch học thất bại');
        }
    }
);