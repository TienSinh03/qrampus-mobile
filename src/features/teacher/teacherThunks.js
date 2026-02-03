import { setAccessToken, clearToken, instance } from "../../api/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

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
            
            console.log('Fetched teacher schedules:', response?.data);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy lịch giảng dạy thất bại');
            }

            return {
                schedules: response?.data?.data?.schedules || [],
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
            return {
                schedules: response?.data?.data?.schedules || []
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message || 'Lấy lịch giảng dạy hôm nay thất bại');
        }
    }
);