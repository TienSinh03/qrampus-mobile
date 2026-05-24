import { createSlice, createSelector } from '@reduxjs/toolkit';
import { getStudentSurveys, getSurveyQuestions } from './surveyThunks';

const initialState = {
  enrollments: [],
  loading: false,
  error: null,
  searchKeyword: '',
  questions: [],
  questionsLoading: false,
  questionsError: null,
};

const surveySlice = createSlice({
  name: 'survey',
  initialState,
  reducers: {
    setSearchKeyword: (state, action) => {
      state.searchKeyword = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getStudentSurveys.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getStudentSurveys.fulfilled, (state, action) => {
        state.loading = false;
        state.enrollments = action.payload;
      })
      .addCase(getStudentSurveys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSurveyQuestions.pending, (state) => {
        state.questionsLoading = true;
        state.questionsError = null;
      })
      .addCase(getSurveyQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false;
        state.questions = action.payload;
      })
      .addCase(getSurveyQuestions.rejected, (state, action) => {
        state.questionsLoading = false;
        state.questionsError = action.payload;
      });
  },
});

export const { setSearchKeyword } = surveySlice.actions;
export default surveySlice.reducer;

/* ================= SELECTORS ================= */

export const selectEnrollments = (state) => state.survey.enrollments;
export const selectLoading = (state) => state.survey.loading;
export const selectError = (state) => state.survey.error;
export const selectSearchKeyword = (state) => state.survey.searchKeyword;
export const selectQuestions = (state) => state.survey.questions;
export const selectQuestionsLoading = (state) => state.survey.questionsLoading;
export const selectQuestionsError = (state) => state.survey.questionsError;

/**
 * 1 enrollment = 1 card
 */
export const selectSurveyItems = createSelector(
  [selectEnrollments],
  (enrollments) =>
    enrollments.map((enrollment) => {
      const {
        id,
        learning_type,
        practice_group_id,
        practiceGroup,
        courseSection,
      } = enrollment;

      const surveys = courseSection?.surveys || [];

      const validSurveys = surveys.filter((survey) => {
        if (learning_type === 'theory') {
          return survey.practice_group_id === null;
        }
        if (learning_type === 'practice') {
          return survey.practice_group_id === practice_group_id;
        }
        return false;
      });

      return {
        enrollmentId: id,
        courseCode: courseSection.code,
        courseName: courseSection.name,
        semester: courseSection.semester,

        learningType: learning_type,
        practiceGroupName: practiceGroup?.group_name,
        practiceGroupNumber: practiceGroup?.number_group,

        hasSurvey: validSurveys.length > 0,
        surveys: validSurveys,
      };
    })
);

export const selectFilteredSurveyItems = createSelector(
  [selectSurveyItems, selectSearchKeyword],
  (items, keyword) => {
    if (!keyword) return items;
    const lower = keyword.toLowerCase();
    return items.filter(
      (item) =>
        item.courseName.toLowerCase().includes(lower) ||
        item.courseCode.toLowerCase().includes(lower)
    );
  }
);
