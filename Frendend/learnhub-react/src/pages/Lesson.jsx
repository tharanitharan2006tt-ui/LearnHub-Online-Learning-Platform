import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./Lesson.css";

const getEmbedUrl = (url) => {
  if (!url) return "";
  const youtubeId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)?.[1];
  return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;
};

export default function Lesson() {
  const { courseSlug: routeCourseSlug, lessonId: routeLessonId } = useParams();
  const courseSlug = routeCourseSlug || "python-programming";
  const lessonKey = `${courseSlug}:${routeLessonId || "first"}`;
  const [lessons, setLessons] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [loadedLessonKey, setLoadedLessonKey] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [progressError, setProgressError] = useState("");
  const [loadError, setLoadError] = useState("");
  const isLoadingProgress = loadedLessonKey !== lessonKey;

  useEffect(() => {
    let isActive = true;

    Promise.all([api.getLessonsForCourse(courseSlug), api.getLessonProgress()])
      .then(([courseLessons, progressRecords]) => {
        if (!isActive) return;
        setLoadError("");
        setProgressError("");
        const lessonList = Array.isArray(courseLessons) ? courseLessons : [];
        const selected = routeLessonId
          ? lessonList.find((lesson) => String(lesson.id) === routeLessonId)
          : lessonList[0];
        setLessons(lessonList);
        if (!selected) {
          setLoadError("This lesson could not be found in the selected course.");
          return;
        }
        setCompleted(Boolean(progressRecords.find(
          (record) => record.lesson === selected.id && record.completed
        )));
      })
      .catch((error) => {
        if (isActive) setLoadError(error.message || "Unable to load this lesson.");
      })
      .finally(() => {
        if (isActive) setLoadedLessonKey(lessonKey);
      });

    return () => {
      isActive = false;
    };
  }, [courseSlug, lessonKey, routeLessonId]);

  const lesson = routeLessonId
    ? lessons.find((item) => String(item.id) === routeLessonId)
    : lessons[0];

  const handleComplete = async () => {
    if (!lesson) return;
    setIsSaving(true);
    setProgressError("");

    try {
      await api.saveLessonProgress(lesson.id, true);
      setCompleted(true);
      if (lesson.id === 1 && courseSlug === "python-programming") {
        localStorage.setItem("pythonLesson1Completed", "true");
      }
    } catch (error) {
      console.error("Progress Error:", error);
      setProgressError(error.message || "Unable to save lesson progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingProgress) {
    return <section className="lesson_page"><div className="lesson_container"><p role="status">Loading lesson…</p></div></section>;
  }

  if (loadError || !lesson) {
    return (
      <section className="lesson_page">
        <div className="lesson_container">
          <div className="lesson_content">
            <h2>Unable to load lesson</h2>
            <p role="alert">{loadError || "This lesson is not available."}</p>
            <Link to="/my-learning" className="next_button">Back to My Learning</Link>
          </div>
        </div>
      </section>
    );
  }

  const videoUrl = getEmbedUrl(lesson.video_url);

  return (
    <section className="lesson_page">
      <div className="lesson_container">
        <div className="lesson_header">
          <h1>{lesson.title}</h1>
          <p>{lesson.course_title || "Course lesson"} · Lesson {lesson.order}</p>
        </div>

        {videoUrl && (
          <div className="video_box">
            <iframe
              width="100%"
              height="450"
              src={videoUrl}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="lesson_content">
          <h2>{lesson.title}</h2>
          <p>{lesson.description || "Work through the lesson material, then mark it complete to save your progress."}</p>

          <button
            className={`complete_button${completed ? " is_completed" : ""}`}
            onClick={handleComplete}
            disabled={completed || isSaving}
          >
            {isSaving ? "Saving progress..." : completed ? "✓ Lesson Completed" : "Mark as Completed"}
          </button>

          {progressError && <p className="progress_error" role="alert">{progressError}</p>}

          {completed && (
            <div className="completed_message">
              <strong>🎉 Great job!</strong>
              <p>Your lesson progress has been saved.</p>
            </div>
          )}

          {completed && lesson.quiz_id && (
            <Link to={`/quiz/${lesson.quiz_id}`} className="next_button">
              Take Quiz →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
