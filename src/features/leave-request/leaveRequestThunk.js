import { createAsyncThunk } from "@reduxjs/toolkit";
import { instance } from "../../api/axiosInstance";

// ==================== STUDENT THUNKS ====================

/**
 * Tạo yêu cầu nghỉ phép mới (Sinh viên)
 */
export const createLeaveRequestThunk = createAsyncThunk(
    'leaveRequests/create',
    async (formData, { rejectWithValue }) => {
        try {
            const response = await instance.post('/leave-requests/student', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60s timeout for file upload
            });
            
            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Cập nhật yêu cầu nghỉ phép thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Tạo yêu cầu nghỉ phép thất bại'
            );
        }
    }
);

/**
 * Lấy danh sách yêu cầu nghỉ của sinh viên
 */
export const getLeaveRequestsOfStudentThunk = createAsyncThunk(
    'leaveRequests/student/getMyLeaveRequests',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { status, page, limit } = params;
            const queryParams = new URLSearchParams();
            if (status) queryParams.append('status', status);
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);

            const queryString = queryParams.toString();
            const url = `/leave-requests/student${queryString ? `?${queryString}` : ''}`;
            
            const response = await instance.get(url);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy danh sách yêu cầu nghỉ thất bại');
            }

            return {
                leaves: response?.data?.data?.leaves || [],
                pagination: response?.data?.data?.pagination || null,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Lấy danh sách yêu cầu nghỉ thất bại'
            );
        }
    }
);

// ==================== TEACHER THUNKS ====================

/**
 * Lấy danh sách yêu cầu nghỉ của giảng viên
 */
export const getTeacherLeaveRequestsThunk = createAsyncThunk(
    'leaveRequests/teacher/getAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { schedule_id, status, page, limit } = params;
            const queryParams = new URLSearchParams();
            if (schedule_id) queryParams.append('class_session_id', schedule_id);
            if (status) queryParams.append('status', status);
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);

            const queryString = queryParams.toString();
            const url = `/leave-requests/teacher${queryString ? `?${queryString}` : ''}`;
            
            const response = await instance.get(url);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy danh sách yêu cầu nghỉ thất bại');
            }
            console.log('Leave requests response:', response?.data?.data?.leaves);
            return {
                leaves: response?.data?.data?.leaves || [],
                pagination: response?.data?.data?.pagination || null,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Lấy danh sách yêu cầu nghỉ thất bại'
            );
        }
    }
);

/**
 * Lấy danh sách yêu cầu nghỉ theo lịch học/lớp (Giảng viên)
 */
export const getLeavesByScheduleThunk = createAsyncThunk(
    'leaveRequests/teacher/getBySchedule',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { courseSectionId, schedule_id, status, page, limit } = params;
            const queryParams = new URLSearchParams();
            if (courseSectionId) queryParams.append('courseSectionId', courseSectionId);
            if (schedule_id) queryParams.append('class_session_id', schedule_id);
            if (status) queryParams.append('status', status);
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);

            const queryString = queryParams.toString();
            const url = `/leave-requests/teacher${queryString ? `?${queryString}` : ''}`;
            
            const response = await instance.get(url);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Lấy danh sách yêu cầu nghỉ theo lịch thất bại');
            }

            return {
                leaves: response?.data?.data?.leaves || [],
                pagination: response?.data?.data?.pagination || null,
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Lấy danh sách yêu cầu nghỉ theo lịch thất bại'
            );
        }
    }
);


/**
 * Duyệt yêu cầu nghỉ phép (Giảng viên)
 */
export const approveLeaveRequestThunk = createAsyncThunk(
    'leaveRequests/approve',
    async ({ id, rejectReason = '' }, { rejectWithValue }) => {
        try {
            const response = await instance.put(`/leave-requests/teacher/${id}/approve`, {
                rejectReason, // Backend expects this field for notes
            });

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Duyệt yêu cầu nghỉ thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Duyệt yêu cầu nghỉ thất bại'
            );
        }
    }
);

/**
 * Từ chối yêu cầu nghỉ phép (Giảng viên)
 */
export const rejectLeaveRequestThunk = createAsyncThunk(
    'leaveRequests/reject',
    async ({ id, rejectReason }, { rejectWithValue }) => {
        try {
            if (!rejectReason || rejectReason.trim().length < 10) {
                throw new Error('Lý do từ chối phải có ít nhất 10 ký tự');
            }

            const response = await instance.put(`/leave-requests/teacher/${id}/reject`, {
                rejected_reason: rejectReason,
            });

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Từ chối yêu cầu nghỉ thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Từ chối yêu cầu nghỉ thất bại'
            );
        }
    }
)

// ==================== STUDENT CANCEL THUNK ====================

/**
 * Hủy yêu cầu nghỉ phép (Sinh viên)
 * Chỉ được hủy khi đang ở trạng thái pending
 */
export const cancelLeaveRequestThunk = createAsyncThunk(
    'leaveRequests/student/cancel',
    async (leaveRequestId, { rejectWithValue }) => {
        try {
            const response = await instance.delete(`/leave-requests/student/${leaveRequestId}`);

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Hủy yêu cầu nghỉ phép thất bại');
            }

            return {
                id: leaveRequestId,
                ...response.data.data
            };
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Hủy yêu cầu nghỉ phép thất bại'
            );
        }
    }
)

export const updateLeaveRequestThunk = createAsyncThunk(
    'leaveRequests/student/update',
    async ({ leaveRequestId, formData }, { rejectWithValue }) => {
        try {
            const response = await instance.put(`/leave-requests/student/${leaveRequestId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000, // 60s timeout for file upload
            });

            if (!response?.data?.success) {
                throw new Error(response?.data?.message || 'Tạo yêu cầu nghỉ phép thất bại');
            }

            return response.data.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data?.message || error.message || 'Cập nhật yêu cầu nghỉ phép thất bại'
            );
        }
    });