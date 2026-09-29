import { Link } from "react-router-dom";

export default function CourseCard({ title, description, price, slug }) {
  const courseSlug = slug || title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="course_card">
      <h3>{title}</h3>
      <p>{description}</p>
      <span>₹{price}</span>
      <Link to={`/courses/${courseSlug}`} className="course_button">View Course</Link>
    </div>
  );
}
