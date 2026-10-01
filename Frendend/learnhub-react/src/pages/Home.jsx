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
          <span className="hero_eyebrow"><span aria-hidden="true">✦</span> YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>Small lessons.<br /><span>Big possibilities.</span></h1>
          <p>Discover practical courses, learn at your own pace, and turn the skills you build today into what comes next.</p>
          <div className="hero_actions">
            <Link to="/courses" className="hero_button">Explore Courses <span aria-hidden="true">→</span></Link>
            <Link to="/register" className="hero_text_link">Start learning for free</Link>
          </div>
          <div className="hero_note"><span aria-hidden="true">✓</span> Learn at your own pace, from anywhere</div>
        </div>
        <div className="hero_visual">
          <div className="hero_image_frame">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1100&q=85"
              alt="Students learning together around a laptop"
              fetchPriority="high"
            />
          </div>
          <div className="hero_image_orbit" aria-hidden="true" />
          <div className="hero_floating_card hero_floating_card_top">
            <span className="floating_icon floating_icon_purple" aria-hidden="true">✦</span>
            <span><strong>Learn something new</strong><small>One lesson at a time</small></span>
          </div>
          <div className="hero_floating_card hero_floating_card_bottom">
            <span className="floating_icon floating_icon_yellow" aria-hidden="true">✓</span>
            <span><strong>Your pace, your path</strong><small>Keep your progress</small></span>
          </div>
        </div>
      </section>
      <section className="benefits_section" aria-label="LearnHub benefits">
        <div className="benefit_item">
          <span className="benefit_icon benefit_icon_purple" aria-hidden="true">◎</span>
          <div><h3>Learn by doing</h3><p>Build useful skills with focused, practical lessons.</p></div>
        </div>
        <div className="benefit_item">
          <span className="benefit_icon benefit_icon_coral" aria-hidden="true">↗</span>
          <div><h3>Go at your pace</h3><p>Pick up where you left off whenever it suits you.</p></div>
        </div>
        <div className="benefit_item">
          <span className="benefit_icon benefit_icon_mint" aria-hidden="true">✧</span>
          <div><h3>Celebrate progress</h3><p>Track your learning and work toward course certificates.</p></div>
        </div>
      </section>
      <section className="popular_courses">
        <span className="section_eyebrow">FIND YOUR NEXT SKILL</span>
        <h2>Courses to get you moving</h2>
        <p>Choose a topic that sparks your curiosity and start learning today.</p>
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
      <section className="home_cta">
        <div className="cta_sparkle cta_sparkle_one" aria-hidden="true">✦</div>
        <div className="cta_sparkle cta_sparkle_two" aria-hidden="true">✧</div>
        <span className="section_eyebrow">READY WHEN YOU ARE</span>
        <h2>Make room for your next big idea.</h2>
        <p>Explore the catalog and find a course that takes you one step further.</p>
        <Link to="/courses" className="cta_button">Find your course <span aria-hidden="true">→</span></Link>
      </section>
    </div>
  );
}
