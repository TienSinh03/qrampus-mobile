import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BaseCoursesScreen from '../../components/courses/BaseCoursesScreen';
import { 
  getTeacherCoursesThunk 
} from '../../features/teacher/teacherThunks';
import { 
  selectTeacherCourses, 
  selectCoursesLoading,
  selectCoursesError 
} from '../../features/teacher/teacherSlice';

const TeacherCoursesScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();
  
  // Selectors
  const courses = useSelector(selectTeacherCourses);
  const isLoading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);

  // Load courses on mount
  useEffect(() => {
    dispatch(getTeacherCoursesThunk());
  }, [dispatch]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(getTeacherCoursesThunk()).finally(() => {
      setRefreshing(false);
    });
  }, [dispatch]);

  // Handle course press
  const handleCoursePress = useCallback((course) => {
    console.log('Course pressed:', course);
    // Navigate to course detail screen
    navigation.navigate('CourseDetail', { 
      course,
      userRole: 'teacher'
    });
  }, [navigation]);

  return (
    <BaseCoursesScreen
      navigation={navigation}
      userRole="teacher"
      courses={courses}
      isLoading={isLoading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      onCoursePress={handleCoursePress}
      error={error}
    />
  );
};

export default TeacherCoursesScreen;
