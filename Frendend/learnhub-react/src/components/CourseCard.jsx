import { Link } from "react-router-dom";

const defaultCourseImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80";

export default function CourseCard({ title, description, price, slug, imageUrl }) {
  const courseSlug = slug || title.toLowerCase().replace(/\s+/g, "-");
  const resolvedImage = imageUrl || defaultCourseImage;

  return (
    <div className="course_card">
      <img src={resolvedImage} alt={title} className="course_card_image" />
      <h3>{title}</h3>
      <p>{description}</p>
      <span>₹{price}</span>
      <Link to={`/courses/${courseSlug}`} className="course_button">View Course</Link>
    </div>
  );
}
