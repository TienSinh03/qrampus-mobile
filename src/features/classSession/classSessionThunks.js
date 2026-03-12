import { createAsyncThunk } from "@reduxjs/toolkit";
import { instance } from "../../api/axiosInstance";

/**
 * Lấy danh sách sinh viên theo buổi học 
 * - Lý thuyết: tất cả sinh viên đăng ký học phần 
 * - Thực hành: chỉ sinh viên thuộc nhóm thực hành đó
 */
export const getStudentsByClassSessionThunk = createAsyncThunk(
    'classSession/getStudentsByClassSession',
    async (classSessionId, { rejectWithValue }) => {
        try {
            const response = await instance.get(`/teachers/class-sessions/${classSessionId}/students`);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy danh sách sinh viên thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Lấy danh sách sinh viên thất bại'
            );
        }
    }
);
