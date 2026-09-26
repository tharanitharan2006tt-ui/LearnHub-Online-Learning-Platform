import { useState } from "react";
import { Link } from "react-router-dom";
import "./Quiz.css";

export default function Quiz() {
  const questions = [
    { question: "What is Python?", options: ["A programming language", "A database", "An operating system", "A web browser"], answer: "A programming language" },
    { question: "Which symbol is used to create a comment in Python?", options: ["//", "#", "/* */", "<!-- -->"], answer: "#" },
    { question: "Which function is used to display output in Python?", options: ["display()", "echo()", "print()", "output()"], answer: "print()" },
    { question: "Which keyword is used to create a function in Python?", options: ["function", "define", "def", "fun"], answer: "def" },
    { question: "Which data type is used to store text in Python?", options: ["int", "float", "string", "boolean"], answer: "string" }
  ];

  const savedScore = localStorage.getItem("pythonQuizScore");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(savedScore !== null ? Number(savedScore) : null);

  const handleAnswerChange = (questionIndex, answer) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: answer });
  };

  const handleSubmit = () => {
    if (Object.keys(selectedAnswers).length !== questions.length) {
      alert("Please answer all questions.");
      return;
    }
    let totalScore = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.answer) totalScore++;
    });
    setScore(totalScore);
    localStorage.setItem("pythonQuizScore", totalScore);
    if (totalScore >= 3) {
      localStorage.setItem("pythonQuizPassed", "true");
      localStorage.setItem("pythonCourseCompleted", "true");
    } else {
      localStorage.removeItem("pythonQuizPassed");
      localStorage.removeItem("pythonCourseCompleted");
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setScore(null);
    localStorage.removeItem("pythonQuizScore");
    localStorage.removeItem("pythonQuizPassed");
    localStorage.removeItem("pythonCourseCompleted");
  };

  return (
    <section className="quiz_page">
      <div className="quiz_container">
        <div className="quiz_header"><h1>Python Programming Quiz</h1><p>Test your knowledge from Lesson 1: Introduction to Python.</p></div>
        {score === null && questions.map((question, questionIndex) => (
          <div className="question_card" key={questionIndex}><h2>{questionIndex + 1}. {question.question}</h2><div className="options">
            {question.options.map((option, optionIndex) => <label className="option" key={optionIndex}><input type="radio" name={`question-${questionIndex}`} value={option} checked={selectedAnswers[questionIndex] === option} onChange={() => handleAnswerChange(questionIndex, option)} /><span>{option}</span></label>)}
          </div></div>
        ))}
        {score === null && <div className="quiz_action"><button className="submit_quiz_button" onClick={handleSubmit}>Submit Quiz</button></div>}
        {score !== null && <div className="quiz_result"><h2>ðŸŽ‰ Quiz Completed!</h2><p className="score_text">Your Score</p><div className="score">{score} / {questions.length}</div>
          {score >= 3 ? <p className="result_message success">Excellent! You passed the quiz.</p> : <p className="result_message fail">Keep learning and try the quiz again.</p>}
          <div className="result_buttons"><button className="retake_button" onClick={handleRetake}>Retake Quiz</button>{score >= 3 && <Link to="/certificate" className="certificate_button">Get Certificate</Link>}<Link to="/my-learning" className="learning_button">Back to My Learning</Link></div>
        </div>}
      </div>
    </section>
  );
}
