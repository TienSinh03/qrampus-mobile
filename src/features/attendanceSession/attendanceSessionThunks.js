import { createAsyncThunk } from "@reduxjs/toolkit";
import { instance } from "../../api/axiosInstance";

/**
 * Tạo phiên điểm danh mới
 * POST /attendance-sessions
 */
export const createAttendanceSessionThunk = createAsyncThunk(
    'attendanceSession/create',
    async ({ class_session_id, session_duration_minutes, qr_interval = 10 }, { rejectWithValue }) => {
        try {
            const response = await instance.post('/attendance-sessions', {
                class_session_id,
                session_duration_minutes,
                qr_interval,
            });

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Tạo phiên điểm danh thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Tạo phiên điểm danh thất bại'
            );
        }
    }
);

/**
 * Lấy lịch sử phiên điểm danh theo course_section_id
 * GET /attendance-sessions/history?course_section_id=...&page=...&limit=...
 */
export const getAttendanceHistoryThunk = createAsyncThunk(
    'attendanceSession/getHistory',
    async ({ course_section_id, practice_group_id, page = 1, limit = 10 }, { rejectWithValue }) => {
        try {
            const response = await instance.get('/attendance-sessions/history', {
                params: { course_section_id, practice_group_id, page, limit },
            });

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy lịch sử phiên điểm danh thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Lấy lịch sử phiên điểm danh thất bại'
            );
        }
    }
);

/**
 * Đóng phiên điểm danh
 * PATCH /attendance-sessions/:id/close
 */
export const closeAttendanceSessionThunk = createAsyncThunk(
    'attendanceSession/close',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await instance.patch(`/attendance-sessions/${sessionId}/close`);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Đóng phiên điểm danh thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Đóng phiên điểm danh thất bại'
            );
        }
    }
);

/**
 * Sinh QR mới khi QR cũ hết hạn
 * POST /attendance-sessions/:id/next-qr
 */
export const getNextQRThunk = createAsyncThunk(
    'attendanceSession/nextQR',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await instance.post(`/attendance-sessions/${sessionId}/next-qr`);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Tạo mã QR mới thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Tạo mã QR mới thất bại'
            );
        }
    }
);

/**
 * Sinh viên quét QR để điểm danh
 * POST /attendance-sessions/scan
 */
export const scanAttendanceByQRThunk = createAsyncThunk(
    'attendanceSession/scanByQr',
    async ({ qr_token, class_session_id, device_info }, { rejectWithValue }) => {
        try {
            const response = await instance.post('/attendance-sessions/scan', {
                qr_token,
                class_session_id,
                device_info,
            });

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Điểm danh thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Điểm danh thất bại'
            );
        }
    }
);

/**
 * Lấy thống kê chi tiết 1 phiên điểm danh (dành cho GV)
 * GET /attendance-sessions/:id/stats
 */
export const getAttendanceSessionStatsThunk = createAsyncThunk(
    'attendanceSession/getSessionStats',
    async (sessionId, { rejectWithValue }) => {
        try {
            const response = await instance.get(`/attendance-sessions/${sessionId}/stats`);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy thống kê phiên điểm danh thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Lấy thống kê phiên điểm danh thất bại'
            );
        }
    }
);
