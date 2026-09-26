import "./Home.css";

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero_content">
          <h1>Learn New Skills with LearnHub</h1>
          <p>Discover quality online courses and improve your skills anytime, anywhere.</p>
          <button className="hero_button">Explore Courses</button>
        </div>
      </section>
      <section className="popular_courses">
        <h2>Popular Courses</h2>
        <p>Start learning from our most popular courses.</p>
        <div className="course_container">
          <div className="course_card"><h3>Python Programming</h3><p>Learn Python programming from basics to advanced concepts.</p><button>View Course</button></div>
          <div className="course_card"><h3>Web Development</h3><p>Learn HTML, CSS and JavaScript to build modern websites.</p><button>View Course</button></div>
          <div className="course_card"><h3>React Development</h3><p>Build modern and interactive web applications using React.</p><button>View Course</button></div>
        </div>
      </section>
    </main>
  );
}
