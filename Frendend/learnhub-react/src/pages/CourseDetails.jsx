import { Link, useParams, useNavigate } from "react-router-dom";
import "./CourseDetails.css";

const courses = {
  "python-programming": { title: "Python Programming", intro: "Learn Python programming from basic concepts to advanced topics and build real-world applications.", rating: "4.8 / 5", students: "2,500+", lessons: "20 Lessons", duration: "15 Hours", price: "999", topics: ["Python fundamentals", "Variables and data types", "Conditional statements", "Loops and functions", "Object-oriented programming", "File handling", "Real-world Python projects"] },
  "java-programming": { title: "Java Programming", intro: "Learn Java programming from fundamentals to object-oriented programming and application development.", rating: "4.7 / 5", students: "1,800+", lessons: "20 Lessons", duration: "16 Hours", price: "999", topics: ["Java fundamentals", "Variables and data types", "Conditional statements", "Loops and arrays", "Object-oriented programming", "Exception handling", "Java projects"] },
  javascript: { title: "JavaScript", intro: "Learn JavaScript and build interactive, dynamic and modern web applications.", rating: "4.6 / 5", students: "2,000+", lessons: "20 Lessons", duration: "14 Hours", price: "799", topics: ["JavaScript fundamentals", "Variables and data types", "Functions", "Arrays and objects", "DOM manipulation", "Events", "Interactive web projects"] },
  "c-programming": { title: "C Programming", intro: "Learn C programming fundamentals and develop strong problem-solving and programming skills.", rating: "4.5 / 5", students: "1,500+", lessons: "20 Lessons", duration: "12 Hours", price: "699", topics: ["C fundamentals", "Variables and data types", "Operators", "Conditional statements", "Loops", "Functions and arrays", "C programming projects"] },
  "c++-programming": { title: "C++ Programming", intro: "Learn C++ programming and understand object-oriented programming concepts.", rating: "4.6 / 5", students: "1,300+", lessons: "20 Lessons", duration: "14 Hours", price: "799", topics: ["C++ fundamentals", "Variables and data types", "Functions", "Classes and objects", "Inheritance", "Polymorphism", "C++ projects"] },
  "react-development": { title: "React Development", intro: "Build modern and interactive web applications using React.js.", rating: "4.9 / 5", students: "2,200+", lessons: "20 Lessons", duration: "18 Hours", price: "1299", topics: ["React fundamentals", "Components", "Props and state", "React hooks", "React Router", "API integration", "React projects"] }
};

export default function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = courses[courseId];
  const handleEnroll = () => {
    const isLoggedIn = localStorage.getItem("learnhubLoggedIn") === "true";
    if (!isLoggedIn) { alert("Please login to enroll in this course."); navigate("/login"); return; }
    localStorage.setItem("enrolledCourse", JSON.stringify({ id: courseId, ...course }));
    alert(`${course.title} enrolled successfully!`); navigate("/my-learning");
  };
  if (!course) return <section className="course_details"><div className="course_details_container"><h1>Course Not Found</h1><p className="course_intro">The requested course could not be found.</p><div className="enroll_box"><Link to="/courses" className="course_button">Back to Courses</Link></div></div></section>;
  return (
    <section className="course_details"><div className="course_details_container"><h1>{course.title}</h1><p className="course_intro">{course.intro}</p>
      <div className="course_info"><div><strong>Ã¢Â­Â Rating</strong><p>{course.rating}</p></div><div><strong>Ã°Å¸â€˜Â¨Ã¢â‚¬ÂÃ°Å¸Å½â€œ Students</strong><p>{course.students}</p></div><div><strong>Ã°Å¸â€œÅ¡ Lessons</strong><p>{course.lessons}</p></div><div><strong>Ã¢ÂÂ± Duration</strong><p>{course.duration}</p></div></div>
      <div className="course_content"><h2>What You Will Learn</h2><ul>{course.topics.map((topic, index) => <li key={index}>{topic}</li>)}</ul></div>
      <div className="enroll_box"><h2>Course Price</h2><span>Ã¢â€šÂ¹{course.price}</span><button className="course_button" onClick={handleEnroll}>Enroll Now</button></div>
    </div></section>
  );
}
