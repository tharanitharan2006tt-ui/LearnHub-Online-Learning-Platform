import CourseCard from "../components/CourseCard";
import "./Courses.css";

export default function Courses() {
  return (
    <section className="courses_page">
      <h1>Explore Courses</h1>
      <p className="courses_description">Learn programming and technology skills with LearnHub.</p>
      <div className="courses_container">
        <CourseCard title="Python Programming" description="Learn Python from basics to advanced concepts." price="999" />
        <CourseCard title="Java Programming" description="Learn Java programming and object-oriented concepts." price="999" />
        <CourseCard title="JavaScript" description="Build interactive and modern web applications." price="799" />
        <CourseCard title="C Programming" description="Learn C programming fundamentals and problem solving." price="699" />
        <CourseCard title="C++ Programming" description="Learn object-oriented programming with C++." price="799" />
        <CourseCard title="React Development" description="Build modern user interfaces using React.js." price="1299" />
      </div>
    </section>
  );
}
