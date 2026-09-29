import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./Quiz.css";

export default function Quiz() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loadedQuizId, setLoadedQuizId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isLoading = Boolean(quizId && loadedQuizId !== quizId);

  useEffect(() => {
    let isActive = true;
    if (!quizId) {
      return () => {
        isActive = false;
      };
    }

    api.getQuiz(quizId)
      .then((quizData) => {
        if (isActive) {
          setQuiz(quizData);
          setError("");
        }
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message || "Unable to load this quiz.");
      })
      .finally(() => {
        if (isActive) setLoadedQuizId(quizId);
      });

    return () => {
      isActive = false;
    };
  }, [quizId]);

  const questions = quiz?.questions || [];

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (Object.keys(selectedAnswers).length !== questions.length) {
      setError("Please answer every question before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await api.submitQuiz(quizId, selectedAnswers);
      const quizResult = {
        score: response.result.score,
        passed: response.result.passed,
        totalQuestions: response.total_questions,
        correctAnswers: response.correct_answers,
      };
      setResult(quizResult);
      localStorage.setItem("pythonQuizScore", String(quizResult.score));
    } catch (requestError) {
      setError(requestError.message || "Unable to submit quiz. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setSelectedAnswers({});
    setResult(null);
    setError("");
  };

  if (isLoading) {
    return <section className="quiz_page"><div className="quiz_container"><p role="status">Loading quiz…</p></div></section>;
  }

  return (
    <section className="quiz_page">
      <div className="quiz_container">
        <div className="quiz_header">
          <h1>{quiz?.title || "Quiz"}</h1>
          <p>Answer all questions and submit to save your result.</p>
        </div>

        {(error || (!quizId && "This quiz link is missing its quiz ID.")) && (
          <p className="quiz_error" role="alert">{error || "This quiz link is missing its quiz ID."}</p>
        )}
        {quiz && !result && questions.length === 0 && (
          <p className="quiz_error" role="alert">No questions are available for this quiz yet.</p>
        )}

        {quiz && !result && questions.length > 0 && (
          <form onSubmit={handleSubmit}>
            {questions.map((question, questionIndex) => (
              <fieldset className="question_card" key={question.id}>
                <legend>{questionIndex + 1}. {question.question_text}</legend>
                <div className="options">
                  {question.choices.map((choice) => (
                    <label className="option" key={choice.id}>
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        value={choice.id}
                        checked={String(selectedAnswers[question.id]) === String(choice.id)}
                        onChange={() => setSelectedAnswers((answers) => ({
                          ...answers,
                          [question.id]: choice.id,
                        }))}
                      />
                      <span>{choice.choice_text}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <div className="quiz_action">
              <button className="submit_quiz_button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </form>
        )}

        {result && (
          <div className="quiz_result">
            <h2>{result.passed ? "🎉 Quiz passed!" : "Quiz completed"}</h2>
            <p className="score_text">Your score</p>
            <div className="score">{result.score}%</div>
            <p className={`result_message ${result.passed ? "success" : "fail"}`}>
              {result.correctAnswers} of {result.totalQuestions} correct
              {result.passed ? " — well done!" : " — keep learning and try again."}
            </p>
            <div className="result_buttons">
              <button className="retake_button" onClick={handleRetake}>Retake Quiz</button>
              {result.passed && quiz.course_id && (
                <Link to={`/certificate/${quiz.course_id}`} className="certificate_button">Get Certificate</Link>
              )}
              <Link to="/my-learning" className="learning_button">Back to My Learning</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
