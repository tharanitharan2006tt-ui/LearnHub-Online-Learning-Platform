import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import "./MyLearning.css";

export default function MyLearning() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadLearning = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [enrollments, lessonProgress] = await Promise.all([
          api.getMyLearning(),
          api.getLessonProgress(),
        ]);
        const learningCourses = await Promise.all(enrollments.map(async (enrollment) => {
          const [course, progress, lessons] = await Promise.all([
            api.getCourseBySlug(enrollment.course_slug),
            api.getCourseProgress(enrollment.course),
            api.getLessonsForCourse(enrollment.course_slug),
          ]);
          const courseLessons = Array.isArray(lessons) ? lessons : [];
          const nextLesson = courseLessons.find((lesson) => !lessonProgress.some(
            (record) => record.lesson === lesson.id && record.completed
          ));
          return {
            ...course,
            enrollmentId: enrollment.id,
            progress: progress.progress_percentage,
            completedLessons: progress.completed_lessons,
            totalLessons: progress.total_lessons,
            completed: progress.completed || enrollment.completed,
            nextLessonId: nextLesson?.id,
          };
        }));
        if (isActive) setCourses(learningCourses);
      } catch (requestError) {
        if (isActive) setError(requestError.message || "Unable to load your enrolled courses.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadLearning();
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <section className="my_learning">
      <div className="my_learning_container">
        <header className="my_learning_header">
          <span className="my_learning_eyebrow">YOUR LEARNING SPACE</span>
          <h1>My Learning</h1>
          <p>Keep your momentum going. Your courses and progress live here.</p>
        </header>

        {isLoading ? (
          <p className="learning_status" role="status">Loading your courses…</p>
        ) : error ? (
          <p className="learning_error" role="alert">{error}</p>
        ) : courses.length > 0 ? (
          <div className="learning_grid">
            {courses.map((course) => (
              <article className="learning_card" key={course.enrollmentId}>
                <div className="course_top">
                  <div className="course_title_group">
                    <span className="course_icon" aria-hidden="true">↗</span>
                    <div>
                      <span className="course_label">ENROLLED COURSE</span>
                      <h2>{course.title}</h2>
                    </div>
                  </div>
                  <span className={`status${course.completed ? " status_completed" : ""}`}>
                    <span aria-hidden="true" />
                    {course.completed ? "Completed" : "In Progress"}
                  </span>
                </div>

                <p className="course_description">{course.intro || course.description}</p>
                <div className="progress_info">
                  <span>Course progress</span>
                  <strong>{course.progress}%</strong>
                </div>
                <div
                  className="progress_bar"
                  role="progressbar"
                  aria-label={`${course.title} progress`}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-valuenow={course.progress}
                >
                  <div className="progress_fill" style={{ width: `${course.progress}%` }} />
                </div>
                <p className="lesson_count">
                  {course.completedLessons} of {course.totalLessons} lessons completed
                </p>
                {course.completed ? (
                  <Link to={`/certificate/${course.id}`} className="continue_button">
                    View Certificate <span aria-hidden="true">→</span>
                  </Link>
                ) : course.nextLessonId ? (
                  <Link to={`/lesson/${course.slug}/${course.nextLessonId}`} className="continue_button">
                    Continue Learning <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <p className="learning_error">Lessons are not available for this course yet.</p>
                )}
              </article>
            ))}
          </div>
        ) : (
          <div className="empty_learning">
            <div className="empty_learning_icon" aria-hidden="true">✦</div>
            <span className="empty_learning_label">READY WHEN YOU ARE</span>
            <h2>No courses enrolled yet</h2>
            <p>Explore the catalog and choose a course to start building new skills.</p>
            <Link to="/courses" className="continue_button">
              Explore Courses <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
