import { useState } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
  const [enrolledCourse] = useState(() => {
    const savedCourse = localStorage.getItem("enrolledCourse");
    return savedCourse ? JSON.parse(savedCourse) : null;
  });
  const [lessonCompleted] = useState(() => localStorage.getItem("pythonLesson1Completed") === "true");
  const [courseCompleted] = useState(() => localStorage.getItem("pythonCourseCompleted") === "true");
  const [quizScore] = useState(() => {
    const score = localStorage.getItem("pythonQuizScore");
    return score !== null ? Number(score) : null;
  });
  const totalLessons = enrolledCourse ? parseInt(enrolledCourse.lessons) : 20;
  const completedLessons = courseCompleted ? totalLessons : lessonCompleted ? 1 : 0;
  const overallProgress = courseCompleted ? 100 : lessonCompleted ? Math.round((1 / totalLessons) * 100) : 0;
  const certificateCount = courseCompleted ? 1 : 0;
  return (
    <section className="dashboard_page"><div className="dashboard_container">
      <div className="dashboard_header"><h1>Welcome to LearnHub</h1><p>Track your learning progress and continue your courses.</p></div>
      <div className="dashboard_stats">
        <div className="stat_card"><h3>Enrolled Courses</h3><strong>{enrolledCourse ? 1 : 0}</strong></div>
        <div className="stat_card"><h3>Completed Lessons</h3><strong>{completedLessons}</strong></div>
        <div className="stat_card"><h3>Overall Progress</h3><strong>{overallProgress}%</strong></div>
        <div className="stat_card"><h3>Certificates</h3><strong>{certificateCount}</strong></div>
      </div>
      <div className="continue_section"><h2>Continue Learning</h2><p>Pick up where you left off.</p>
        {enrolledCourse ? <div className="continue_grid"><div className="continue_card"><h3>{enrolledCourse.title}</h3><p>{courseCompleted ? "You have successfully completed this course." : "Continue learning and complete your course."}</p>
          <div className="dashboard_progress_info"><span>Progress</span><strong>{overallProgress}%</strong></div>
          <div className="dashboard_progress_bar"><div className="dashboard_progress_fill" style={{ width: `${overallProgress}%` }}></div></div>
          <p className="dashboard_lesson_count">{completedLessons} of {totalLessons} lessons completed</p>
          {courseCompleted ? <Link to="/certificate" className="dashboard_button">View Certificate</Link> : <Link to="/lesson" className="dashboard_button">Continue Learning</Link>}
          {quizScore !== null && <p className="dashboard_quiz_score">Latest Quiz Score: {quizScore} / 5</p>}
        </div></div> : <div className="dashboard_empty"><h3>No Course Enrolled</h3><p>Explore courses and start your learning journey.</p><Link to="/courses" className="dashboard_button">Explore Courses</Link></div>}
      </div>
    </div></section>
  );
}
