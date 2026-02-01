import { setAccessToken, clearToken, instance } from "../../api/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";

export const getStudentProfileThunk = createAsyncThunk(
    'student/profile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await instance.get('/students/profile');
            console.log('Fetched student profile:', response?.data);
            return response?.data?.data;
        } catch (error) {
            return rejectWithValue(error.response?.message || { message: 'Lấy thông tin sinh viên thất bại' });
        }
    }
)