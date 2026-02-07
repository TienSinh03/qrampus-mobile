import { createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';

/**
 * Transform dữ liệu từ snake_case sang camelCase - Flatten structure
 */
const transformImageSession = (session) => {
  if (!session) return null;

  const classSession = session.classSession || {};
  const courseSection = classSession.courseSection || {};

  return {
    // Image Session fields
    id: session.id,
    classSessionId: session.class_session_id,
    captureType: session.capture_type,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    note: session.note,
    
    // Class Session fields (flattened)
    scheduleTemplateId: classSession.schedule_template_id,
    courseSectionId: classSession.course_section_id,
    practiceGroupId: classSession.practice_group_id,
    personnelId: classSession.personnel_id,
    scheduleType: classSession.schedule_type,
    classDate: classSession.class_date,
    startHour: classSession.start_hour,
    endHour: classSession.end_hour,
    roomId: classSession.room_id,
    sessionNumber: classSession.session_number,
    status: classSession.status,
    isMakeupClass: classSession.is_makeup_class,
    originalClassSessionId: classSession.original_class_session_id,
    substituteReason: classSession.substitute_reason,
    notes: classSession.notes,
    
    // Course Section fields (flattened)
    courseCode: courseSection.code,
    courseName: courseSection.name,
    credits: courseSection.credits,
    courseDescription: courseSection.description,
    semester: courseSection.semester,
    maxStudents: courseSection.max_students,
    practiceSessions: courseSection.practice_sessions,
  };
};

/**
 * Lấy danh sách phiên chụp ảnh của giảng viên (có phân trang)
 */
export const fetchImageSessionsByTeacher = createAsyncThunk(
  'imageSession/fetchByTeacher',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { classSessionId, courseSectionId, page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams();
      
      if (classSessionId) queryParams.append('classSessionId', classSessionId);
      if (courseSectionId) queryParams.append('courseSectionId', courseSectionId);
      queryParams.append('page', page);
      queryParams.append('limit', limit);

      console.log('Fetching image sessions with params:', {
        classSessionId,
        courseSectionId,
        page,
        limit,
      });

      const response = await instance.get(
        `/image-sessions?${queryParams.toString()}`
      );
      
      console.log('Fetched image sessions (raw):', response);
      
      // Transform data từ snake_case sang camelCase
      const transformedData = {
        data: response.data.data.data?.map(transformImageSession) || [],
        total: response.data.data.total,
        page: response.data.data.page,
        limit: response.data.data.limit,
        totalPages: response.data.data.totalPages,
      };
      
      console.log('Transformed image sessions:', transformedData);
      return transformedData;
    } catch (error) {
      console.error('Error fetching image sessions:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi khi lấy danh sách phiên chụp ảnh'
      );
    }
  }
);

/**
 * Kiểm tra trạng thái image session
 */
export const checkImageSessionStatus = createAsyncThunk(
  'imageSession/checkStatus',
  async (classSessionId, { rejectWithValue }) => {
    try {
      const response = await instance.get(
        `/image-sessions/exists/${classSessionId}`
      );
      
      console.log('Check image session status (raw):', response?.data);
      const transformed = response.data.data;
      console.log('Check image session status (transformed):', transformed);
      return transformed;
    } catch (error) {
      console.error('Error checking image session status:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi khi kiểm tra trạng thái phiên chụp ảnh'
      );
    }
  }
);

/**
 * Tạo phiên chụp ảnh mới
 */
export const createImageSession = createAsyncThunk(
  'imageSession/create',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await instance.post('/image-sessions', payload);
      
      console.log('Created image session (raw):', response?.data);
      const transformed = transformImageSession(response.data.data);
      console.log('Created image session (transformed):', transformed);
      return transformed;
    } catch (error) {
      console.error('Error creating image session:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Lỗi khi tạo phiên chụp ảnh'
      );
    }
  }
);
