import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import "./Dashboard.css";

export default function Dashboard() {
  const [course, setCourse] = useState(null);
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [completedLessonCount, setCompletedLessonCount] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");
      try {
        const [enrollments, certificates, lessonProgress] = await Promise.all([
          api.getMyLearning(),
          api.getCertificates(),
          api.getLessonProgress(),
        ]);
        const learningCourses = await Promise.all(enrollments.map(async (enrollment) => {
          const [details, progress, lessons] = await Promise.all([
            api.getCourseBySlug(enrollment.course_slug),
            api.getCourseProgress(enrollment.course),
            api.getLessonsForCourse(enrollment.course_slug),
          ]);
          const courseLessons = Array.isArray(lessons) ? lessons : [];
          const nextLesson = courseLessons.find((lesson) => !lessonProgress.some(
            (record) => record.lesson === lesson.id && record.completed
          ));
          return {
            ...details,
            progress: progress.progress_percentage,
            completedLessons: progress.completed_lessons,
            totalLessons: progress.total_lessons,
            completed: progress.completed || enrollment.completed,
            nextLessonId: nextLesson?.id,
          };
        }));
        const dashboardCourse = learningCourses.find((item) => !item.completed && item.nextLessonId)
          || learningCourses[0]
          || null;
        const lessonTotals = learningCourses.reduce((totals, item) => ({
          completed: totals.completed + item.completedLessons,
          total: totals.total + item.totalLessons,
        }), { completed: 0, total: 0 });

        if (isActive) {
          setCourse(dashboardCourse);
          setEnrolledCount(enrollments.length);
          setCompletedLessonCount(lessonTotals.completed);
          setOverallProgress(lessonTotals.total
            ? Math.round((lessonTotals.completed / lessonTotals.total) * 100)
            : 0);
          setCertificateCount(Array.isArray(certificates) ? certificates.length : 0);
        }
      } catch (requestError) {
        if (isActive) setError(requestError.message || "Unable to load your dashboard.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadDashboard();
    return () => {
      isActive = false;
    };
  }, []);

  const stats = [
    { label: "Enrolled courses", value: enrolledCount, icon: "▤", tone: "indigo" },
    { label: "Lessons completed", value: completedLessonCount, icon: "✓", tone: "green" },
    { label: "Overall progress", value: `${overallProgress}%`, icon: "↗", tone: "blue" },
    { label: "Certificates", value: certificateCount, icon: "✦", tone: "amber" },
  ];

  return (
    <section className="dashboard_page">
      <div className="dashboard_container">
        <header className="dashboard_header">
          <div>
            <span className="dashboard_eyebrow">LEARNHUB OVERVIEW</span>
            <h1>Welcome back to learning.</h1>
            <p>Your progress, courses, and achievements at a glance.</p>
          </div>
          <Link to="/courses" className="dashboard_explore_button">
            Explore courses <span aria-hidden="true">→</span>
          </Link>
        </header>

        {error && <p className="dashboard_error" role="alert">{error}</p>}
        <section className="dashboard_stats" aria-label="Learning statistics">
          {stats.map((stat) => (
            <article className="stat_card" key={stat.label}>
              <div className={`stat_icon stat_icon_${stat.tone}`} aria-hidden="true">{stat.icon}</div>
              <div className="stat_content">
                <p>{stat.label}</p>
                <strong>{isLoading ? "—" : stat.value}</strong>
              </div>
            </article>
          ))}
        </section>

        <section className="continue_section">
          <div className="continue_heading">
            <div>
              <span className="dashboard_eyebrow">PICK UP WHERE YOU LEFT OFF</span>
              <h2>Continue learning</h2>
            </div>
            {course && <Link to="/my-learning" className="dashboard_view_all">My learning <span aria-hidden="true">→</span></Link>}
          </div>

          {isLoading ? (
            <p className="dashboard_loading" role="status">Loading your learning data…</p>
          ) : course ? (
            <article className="continue_card">
              <div className="continue_card_top">
                <div className="continue_course_icon" aria-hidden="true">▶</div>
                <span className={`dashboard_course_status${course.completed ? " is_completed" : ""}`}>
                  <span aria-hidden="true" />
                  {course.completed ? "Completed" : "In progress"}
                </span>
              </div>
              <span className="continue_course_label">YOUR COURSE</span>
              <h3>{course.title}</h3>
              <p className="continue_description">
                {course.completed
                  ? "You have successfully completed this course."
                  : "Keep going—your next lesson is ready when you are."}
              </p>
              <div className="dashboard_progress_info">
                <span>Course progress</span>
                <strong>{course.progress}%</strong>
              </div>
              <div
                className="dashboard_progress_bar"
                role="progressbar"
                aria-label={`${course.title} progress`}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-valuenow={course.progress}
              >
                <div className="dashboard_progress_fill" style={{ width: `${course.progress}%` }} />
              </div>
              <div className="continue_card_footer">
                <p className="dashboard_lesson_count">{course.completedLessons} of {course.totalLessons} lessons completed</p>
              </div>
              {course.completed ? (
                <Link to={`/certificate/${course.id}`} className="dashboard_button">View certificate <span aria-hidden="true">→</span></Link>
              ) : course.nextLessonId ? (
                <Link to={`/lesson/${course.slug}/${course.nextLessonId}`} className="dashboard_button">Continue learning <span aria-hidden="true">→</span></Link>
              ) : (
                <div className="continue_notice">
                  <p>Lessons for this course are not available yet. Check back soon or explore another course.</p>
                  <Link to="/courses" className="dashboard_button secondary_button">Browse courses <span aria-hidden="true">→</span></Link>
                </div>
              )}
            </article>
          ) : !error ? (
            <div className="dashboard_empty">
              <div className="dashboard_empty_icon" aria-hidden="true">✦</div>
              <span className="dashboard_eyebrow">YOUR NEXT STEP</span>
              <h3>Start your learning journey</h3>
              <p>You haven’t enrolled in a course yet. Find a topic you love and begin learning today.</p>
              <Link to="/courses" className="dashboard_button">Browse courses <span aria-hidden="true">→</span></Link>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
