import { Link } from "react-router-dom";

export default function CourseCard({ title, description, price }) {
  const courseSlug = title.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="course_card">
      <h3>{title}</h3>
      <p>{description}</p>
      <span>Ã¢â€šÂ¹{price}</span>
      <Link to={`/course-details/${courseSlug}`} className="course_button">View Course</Link>
    </div>
  );
}
