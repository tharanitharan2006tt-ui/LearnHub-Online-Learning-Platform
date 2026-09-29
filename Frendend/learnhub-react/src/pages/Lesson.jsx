import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./Lesson.css";

const getVideoSource = (value) => {
  if (typeof value !== "string" || !value.trim()) {
    return { type: "unavailable" };
  }

  try {
    const url = new URL(value.trim());
    if (!["http:", "https:"].includes(url.protocol)) {
      return { type: "unavailable" };
    }

    const host = url.hostname.toLowerCase();
    const isYouTubeHost = [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtu.be",
    ].includes(host);

    if (isYouTubeHost) {
      const segments = url.pathname.split("/").filter(Boolean);
      const videoId = host === "youtu.be"
        ? segments[0]
        : url.pathname === "/watch"
          ? url.searchParams.get("v")
          : ["embed", "shorts", "live"].includes(segments[0])
            ? segments[1]
            : null;

      return videoId && /^[\w-]{11}$/.test(videoId)
        ? { type: "youtube", url: `https://www.youtube.com/embed/${videoId}` }
        : { type: "unavailable" };
    }

    if (/\.(mp4|webm|ogv|ogg)$/i.test(url.pathname)) {
      return { type: "file", url: url.href };
    }
  } catch {
    return { type: "unavailable" };
  }

  return { type: "unavailable" };
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

  const videoSource = getVideoSource(lesson.video_url);

  return (
    <section className="lesson_page">
      <div className="lesson_container">
        <div className="lesson_header">
          <h1>{lesson.title}</h1>
          <p>{lesson.course_title || "Course lesson"} · Lesson {lesson.order}</p>
        </div>

        <div className={`video_box${videoSource.type === "unavailable" ? " video_unavailable" : ""}`}>
          {videoSource.type === "youtube" ? (
            <iframe
              src={videoSource.url}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : videoSource.type === "file" ? (
            <video src={videoSource.url} controls playsInline preload="metadata">
              Your browser does not support this video.
            </video>
          ) : (
            <p role="status">Video not available</p>
          )}
        </div>

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
