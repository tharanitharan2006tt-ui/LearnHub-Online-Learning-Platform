import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CourseCard from "../components/CourseCard";
import { api } from "../services/api";
import "./Home.css";

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
    api.getCourses()
      .then((results) => {
        if (isActive) {
          setCourses((Array.isArray(results) ? results : results?.results || []).slice(0, 3));
          setError("");
        }
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message || "Unable to load popular courses.");
      });
    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="home_page">
      <section className="hero">
        <div className="hero_content">
          <h1>Learn New Skills with LearnHub</h1>
          <p>Discover quality online courses and improve your skills anytime, anywhere.</p>
          <Link to="/courses" className="hero_button">Explore Courses</Link>
        </div>
      </section>
      <section className="popular_courses">
        <h2>Popular Courses</h2>
        <p>Start learning from our most popular courses.</p>
        {error && <p className="home_courses_error" role="alert">{error}</p>}
        <div className="course_container">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              slug={course.slug}
              title={course.title}
              description={course.description || course.intro}
              price={course.price}
              imageUrl={course.image_url}
            />
          ))}
          {!error && courses.length === 0 && <p className="home_courses_empty">Courses will be available soon.</p>}
        </div>
        <Link to="/courses" className="home_all_courses">Browse all courses <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
