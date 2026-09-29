import { useEffect, useState } from "react";
import CourseCard from "../components/CourseCard";
import { api } from "../services/api";
import "./Courses.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loadedSearch, setLoadedSearch] = useState(null);
  const [error, setError] = useState("");
  const isLoading = loadedSearch !== search;

  useEffect(() => {
    let isActive = true;

    api.getCourses(search.trim())
      .then((results) => {
        if (isActive) {
          setCourses(Array.isArray(results) ? results : results?.results || []);
          setError("");
        }
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message || "Unable to load courses.");
      })
      .finally(() => {
        if (isActive) setLoadedSearch(search);
      });

    return () => {
      isActive = false;
    };
  }, [search]);

  return (
    <section className="courses_page">
      <h1>Explore Courses</h1>
      <p className="courses_description">Learn programming and technology skills with LearnHub.</p>
      <div className="courses_search">
        <label htmlFor="course-search">Search courses</label>
        <input
          id="course-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by course or topic"
        />
      </div>
      {error && <p className="courses_error" role="alert">{error}</p>}
      {isLoading ? (
        <p className="courses_status" role="status">Loading courses…</p>
      ) : courses.length ? (
        <div className="courses_container">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              slug={course.slug}
              title={course.title}
              description={course.description || course.intro}
              price={course.price}
            />
          ))}
        </div>
      ) : !error ? (
        <p className="courses_status">No courses found. Try another search.</p>
      ) : null}
    </section>
  );
}
