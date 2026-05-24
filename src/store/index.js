import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import studentReducer from '../features/student/studentSlice';
import teacherReducer from '../features/teacher/teacherSlice';
import imageSessionReducer from '../features/imageSession/ImageSessionSlice';
import attendanceImageReducer from '../features/attendanceImage/attendanceImageSlice';
import leaveRequestReducer from '../features/leave-request/leaveRequestSlice';
import surveyReducer from '../features/survey/surveySlice';
import surveyResponseReducer from '../features/surveyResponse/surveyResponseSlice';
import notificationReducer from '../features/notification/notificationSlice';
import classSessionReducer from '../features/classSession/classSessionSlice';
import attendanceSessionReducer from '../features/attendanceSession/attendanceSessionSlice';
import attendanceHistoryReducer from '../features/student/attendanceHistorySlice';
import faceVerifyReducer from '../features/faceVerify/faceVerifySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    teacher: teacherReducer,
    imageSession: imageSessionReducer,
    attendanceImage: attendanceImageReducer,
    leaveRequests: leaveRequestReducer,
    survey: surveyReducer,
    surveyResponse: surveyResponseReducer,
    notification: notificationReducer,
    classSession: classSessionReducer,
    attendanceSession: attendanceSessionReducer,
    attendanceHistory: attendanceHistoryReducer,
    faceVerify: faceVerifyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;