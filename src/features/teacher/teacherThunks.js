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