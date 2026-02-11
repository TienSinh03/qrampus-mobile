import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

/**
 * Lấy tất cả responses của sinh viên cho survey
 * API: GET /survey-responses/survey/:surveyId
 */
export const getSurveyResponsesBySurvey = createAsyncThunk(
  'surveyResponse/getSurveyResponsesBySurvey',
  async (surveyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/survey-responses/survey/${surveyId}`);
      console.log('🔍 API Response:', res.data);
      return res.data.data;
    } catch (err) {
      console.error('❌ Error loading responses:', err);
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải câu trả lời khảo sát'
      );
    }
  }
);

/**
 * Gửi phản hồi khảo sát
 */
export const submitSurveyResponses = createAsyncThunk(
  'surveyResponse/submitSurveyResponses',
  async ({ surveyId, responses }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/survey-responses/${surveyId}/responses`,
        { responses }
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể gửi khảo sát'
      );
    }
  }
);

/**
 * Kiểm tra trạng thái hoàn thành khảo sát
 * API: GET /survey-responses/:surveyId/completion-status
 */
export const checkSurveyCompletion = createAsyncThunk(
  'surveyResponse/checkSurveyCompletion',
  async (surveyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/survey-responses/${surveyId}/completion-status`);
      return { surveyId, ...res.data.data };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể kiểm tra trạng thái khảo sát'
      );
    }
  }
);
