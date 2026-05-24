/**
 * Transform course từ API sang format UI
 */
export const transformCourseToUI = (course) => {
    return {
        enrollmentId: course?.enrollmentId || null,
        courseId: course.courseSectionId || course.id,
        courseCode: course.courseCode || course.code || '',
        courseName: course.courseName || course.name || '',
        semester: course.semester || '',
        credits: course.credits || 0,
        description: course.description || '',
        maxStudents: course.maxStudents || course.max_students || 0,
        practiceGroup: course.practiceGroup || course.practice_group || {},
        classSessions: course.classSessions || course.class_sessions || [],
    };
};