import { useState } from "react";
import { Link } from "react-router-dom";
import "./Lesson.css";
import API_BASE_URL from "../services/api";

export default function Lesson() {
  const [completed, setCompleted] = useState(() => {
    return localStorage.getItem("pythonLesson1Completed") === "true";
  });

  const handleComplete = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/progress/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lesson: 1,
          completed: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save lesson progress");
      }

      setCompleted(true);
      localStorage.setItem("pythonLesson1Completed", "true");

      alert("Lesson completed successfully!");
    } catch (error) {
      console.error("Progress Error:", error);
      alert("Unable to save lesson progress.");
    }
  };

  return (
    <section className="lesson_page">
      <div className="lesson_container">

        {/* Lesson Header */}
        <div className="lesson_header">
          <h1>Python Programming</h1>
          <p>Lesson 1: Introduction to Python</p>
        </div>

        {/* YouTube Video */}
        <div className="video_box">
          <iframe
            width="100%"
            height="450"
            src="https://www.youtube.com/embed/DInMru2Eq6E"
            title="Introduction to Python"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>

        {/* Lesson Content */}
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

          {/* Complete Button */}
          <button
            className="complete_button"
            onClick={handleComplete}
            disabled={completed}
          >
            {completed ? "✓ Lesson Completed" : "Mark as Completed"}
          </button>

          {/* Completion Message */}
          {completed && (
            <div className="completed_message">
              <strong>🎉 Great job!</strong>
              <p>
                You have successfully completed this lesson.
              </p>
            </div>
          )}

          {/* Quiz Button */}
          {completed && (
            <Link to="/quiz" className="next_button">
              Take Quiz →
            </Link>
          )}
        </div>

      </div>
    </section>
  );
}