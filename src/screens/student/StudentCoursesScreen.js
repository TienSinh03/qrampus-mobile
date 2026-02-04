import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BaseCoursesScreen from '../../components/courses/BaseCoursesScreen';
import { 
  getStudentCoursesThunk 
} from '../../features/student/studentThunks';
import { 
  selectStudentCourses, 
  selectCoursesLoading,
  selectCoursesError 
} from '../../features/student/studentSlice';

const StudentCoursesScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  
  // Selectors
  const courses = useSelector(selectStudentCourses);
  const isLoading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);

  // Load courses on mount
  useEffect(() => {
    dispatch(getStudentCoursesThunk());
  }, [dispatch]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(getStudentCoursesThunk()).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch]);

  // Handle course press
  const handleCoursePress = useCallback((course) => {
    console.log('Course pressed:', course);
    // Navigate to course detail screen
    navigation.navigate('CourseDetail', { 
      course,
      userRole: 'student'
    });
  }, [navigation]);

  return (
    <BaseCoursesScreen
      navigation={navigation}
      userRole="student"
      courses={courses}
      isLoading={isLoading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onCoursePress={handleCoursePress}
      error={error}
    />
  );
};

export default StudentCoursesScreen;
