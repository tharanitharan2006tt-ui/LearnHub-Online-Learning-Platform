import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "./CourseDetails.css";

export default function CourseDetails() {
  const { courseId: slug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [course, setCourse] = useState(null);
  const [loadedSlug, setLoadedSlug] = useState(null);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [enrollmentError, setEnrollmentError] = useState("");
  const isLoading = loadedSlug !== slug;

  useEffect(() => {
    let isActive = true;
    api.getCourseBySlug(slug)
      .then((result) => {
        if (isActive) {
          setCourse(result);
          setError("");
        }
      })
      .catch((requestError) => {
        if (isActive) {
          setCourse(null);
          setError(requestError.message || "Unable to load course details.");
        }
      })
      .finally(() => {
        if (isActive) setLoadedSlug(slug);
      });
    return () => {
      isActive = false;
    };
  }, [slug]);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    if (!course) return;
    setIsEnrolling(true);
    setEnrollmentError("");
    try {
      await api.enrollCourse(course.id);
      navigate("/my-learning");
    } catch (requestError) {
      setEnrollmentError(requestError.message || "Unable to enroll in this course.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return <section className="course_details"><div className="course_details_container"><p role="status">Loading course…</p></div></section>;
  }

  if (!course || error) {
    return (
      <section className="course_details">
        <div className="course_details_container">
          <h1>{error ? "Unable to Load Course" : "Course Not Found"}</h1>
          <p className="course_intro">{error || "The requested course could not be found."}</p>
          <div className="enroll_box"><Link to="/courses" className="course_button">Back to Courses</Link></div>
        </div>
      </section>
    );
  }

  const topics = Array.isArray(course.topics)
    ? course.topics
    : (course.topics || "").split(/\r?\n/).filter(Boolean);

  return (
    <section className="course_details">
      <div className="course_details_container">
        <h1>{course.title}</h1>
        <p className="course_intro">{course.intro || course.description}</p>
        <div className="course_info">
          <div><strong>⭐ Rating</strong><p>{course.rating} / 5</p></div>
          <div><strong>👥 Students</strong><p>{Number(course.students || 0).toLocaleString()}+</p></div>
          <div><strong>📚 Lessons</strong><p>{course.lessons} Lessons</p></div>
          <div><strong>⏱ Duration</strong><p>{course.duration} Hours</p></div>
        </div>
        <div className="course_content">
          <h2>What You Will Learn</h2>
          {topics.length ? <ul>{topics.map((topic) => <li key={topic}>{topic}</li>)}</ul> : <p>Course topics will be available soon.</p>}
        </div>
        <div className="enroll_box">
          <h2>Course Price</h2>
          <span>₹{Number(course.price).toLocaleString("en-IN")}</span>
          {enrollmentError && <p className="course_error" role="alert">{enrollmentError}</p>}
          <button className="course_button" onClick={handleEnroll} disabled={isEnrolling}>
            {isEnrolling ? "Enrolling..." : isLoggedIn ? "Enroll Now" : "Login to Enroll"}
          </button>
        </div>
      </div>
    </section>
  );
}
