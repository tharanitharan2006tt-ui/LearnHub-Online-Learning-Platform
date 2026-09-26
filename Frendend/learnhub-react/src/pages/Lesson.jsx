import { useState } from "react";
import { Link } from "react-router-dom";
import "./Lesson.css";

export default function Lesson() {
  const [completed, setCompleted] = useState(() => {
    return localStorage.getItem("pythonLesson1Completed") === "true";
  });

  const handleComplete = () => {
    setCompleted(true);
    localStorage.setItem("pythonLesson1Completed", "true");
  };

  return (
    <section className="lesson_page">
      <div className="lesson_container">
        <div className="lesson_header">
          <h1>Python Programming</h1>
          <p>Lesson 1: Introduction to Python</p>
        </div>

        <div className="video_box">
          <div className="video_placeholder">
            â–¶
          </div>
        </div>

        <div className="lesson_content">
          <h2>Introduction to Python</h2>

          <p>
            Python is a popular, high-level programming language used for
            web development, data science, artificial intelligence,
            automation, and many other applications.
          </p>

          <h3>In this lesson you will learn:</h3>

          <ul>
            <li>What is Python?</li>
            <li>Features of Python</li>
            <li>Applications of Python</li>
            <li>How to install Python</li>
            <li>Writing your first Python program</li>
          </ul>

          <button className="complete_button" onClick={handleComplete} disabled={completed}>
            {completed ? "âœ“ Lesson Completed" : "Mark as Completed"}
          </button>

          {completed && (
            <div className="completed_message">
              <strong>ðŸŽ‰ Great job!</strong>
              <p>You have successfully completed this lesson.</p>
            </div>
          )}

          {completed && (
            <Link to="/quiz" className="next_button">
              Take Quiz â†’
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
