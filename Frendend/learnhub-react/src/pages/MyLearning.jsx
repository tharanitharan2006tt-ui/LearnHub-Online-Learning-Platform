import { useState } from "react";
import { Link } from "react-router-dom";
import "./MyLearning.css";

export default function MyLearning() {
  const [enrolledCourse] = useState(() => {
    const savedCourse = localStorage.getItem("enrolledCourse");
    return savedCourse ? JSON.parse(savedCourse) : null;
  });
  const [lessonCompleted] = useState(() => localStorage.getItem("pythonLesson1Completed") === "true");
  const [courseCompleted] = useState(() => localStorage.getItem("pythonCourseCompleted") === "true");
  const totalLessons = enrolledCourse ? parseInt(enrolledCourse.lessons) : 20;
  const completedLessons = courseCompleted ? totalLessons : lessonCompleted ? 1 : 0;
  const progress = courseCompleted ? 100 : lessonCompleted ? Math.round((1 / totalLessons) * 100) : 0;
  return (
    <section className="my_learning"><div className="my_learning_container">
      <div className="my_learning_header"><h1>My Learning</h1><p>Continue your learning journey with LearnHub.</p></div>
      {enrolledCourse ? <div className="learning_grid"><div className="learning_card">
        <div className="course_top"><h2>{enrolledCourse.title}</h2><span className="status">{courseCompleted ? "Completed" : "In Progress"}</span></div>
        <p className="course_description">{enrolledCourse.intro}</p><div className="progress_info"><span>Progress</span><strong>{progress}%</strong></div>
        <div className="progress_bar"><div className="progress_fill" style={{ width: `${progress}%` }}></div></div>
        <p className="lesson_count">{completedLessons} of {totalLessons} lessons completed</p>
        {courseCompleted ? <Link to="/certificate" className="continue_button">View Certificate</Link> : <Link to="/lesson" className="continue_button">Continue Learning</Link>}
      </div></div> : <div className="empty_learning"><h2>No Courses Enrolled</h2><p>Explore our courses and start learning today.</p><Link to="/courses" className="continue_button">Explore Courses</Link></div>}
    </div></section>
  );
}
