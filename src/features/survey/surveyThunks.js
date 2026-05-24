import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

export const getStudentSurveys = createAsyncThunk(
  'survey/getStudentSurveys',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get('/survey/my-surveys');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh sách khảo sát'
      );
    }
  }
);

export const getSurveyQuestions = createAsyncThunk(
  'survey/getSurveyQuestions',
  async (surveyId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/survey/${surveyId}/questions`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Không thể tải danh sách câu hỏi'
      );
    }
  }
);
