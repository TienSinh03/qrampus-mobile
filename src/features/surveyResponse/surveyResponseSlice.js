import { createSlice } from '@reduxjs/toolkit';
import { getSurveyResponsesBySurvey, submitSurveyResponses, checkSurveyCompletion } from './surveyResponseThunks';

const initialState = {
  responses: [],
  loading: false,
  error: null,
  submitting: false,
  completionStatuses: {}, // { surveyId: { isComplete, totalQuestions, answeredQuestions } }
  checkingCompletion: false,
};

const surveyResponseSlice = createSlice({
  name: 'surveyResponse',
  initialState,
  reducers: {
    clearResponses: (state) => {
      state.responses = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSurveyResponsesBySurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSurveyResponsesBySurvey.fulfilled, (state, action) => {
        state.loading = false;
        state.responses = action.payload;
      })
      .addCase(getSurveyResponsesBySurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitSurveyResponses.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(submitSurveyResponses.fulfilled, (state, action) => {
        state.submitting = false;

        const { surveyId, responses } = action.meta.arg || {};
        if (surveyId) {
          const answeredQuestions = Array.isArray(responses)
            ? responses.length
            : 0;
          const previousStatus = state.completionStatuses[surveyId] || {};

          state.completionStatuses[surveyId] = {
            isComplete: true,
            answeredQuestions,
            totalQuestions:
              previousStatus.totalQuestions &&
              previousStatus.totalQuestions > answeredQuestions
                ? previousStatus.totalQuestions
                : answeredQuestions,
          };
        }
      })
      .addCase(submitSurveyResponses.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })
      .addCase(checkSurveyCompletion.pending, (state) => {
        state.checkingCompletion = true;
      })
      .addCase(checkSurveyCompletion.fulfilled, (state, action) => {
        state.checkingCompletion = false;
        const { surveyId, isComplete, totalQuestions, answeredQuestions } = action.payload;
        state.completionStatuses[surveyId] = { isComplete, totalQuestions, answeredQuestions };
      })
      .addCase(checkSurveyCompletion.rejected, (state) => {
        state.checkingCompletion = false;
      });
  },
});

export const { clearResponses } = surveyResponseSlice.actions;

export const selectResponses = (state) => state.surveyResponse.responses;
export const selectResponsesLoading = (state) => state.surveyResponse.loading;
export const selectSubmitting = (state) => state.surveyResponse.submitting;
export const selectCompletionStatuses = (state) => state.surveyResponse.completionStatuses;
export const selectCheckingCompletion = (state) => state.surveyResponse.checkingCompletion;

export default surveyResponseSlice.reducer;
