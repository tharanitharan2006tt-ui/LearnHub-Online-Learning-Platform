import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import "./Certificate.css";

const formatDate = (dateString) => {
  if (!dateString) return "Recently issued";
  const date = new Date(dateString);
  return Number.isNaN(date.getTime())
    ? "Recently issued"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

export default function Certificate() {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [course, setCourse] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    const loadCertificate = async () => {
      if (!courseId) {
        setError("A course is required to view its certificate.");
        setIsLoading(false);
        return;
      }
      try {
        const [certificates, courses, profile] = await Promise.all([
          api.getCertificates(),
          api.getCourses(),
          api.getProfile(),
        ]);
        const courseRecord = courses.find((item) => String(item.id) === courseId);
        if (!courseRecord) {
          throw new Error("The selected course could not be found.");
        }

        const existing = certificates.find((item) => String(item.course) === courseId);
        const result = existing
          ? existing
          : (await api.generateCertificate(courseId)).certificate;
        if (isActive) {
          setCourse(courseRecord);
          setCertificate(result);
          setUser(profile);
        }
      } catch (requestError) {
        if (isActive) setError(requestError.message || "Unable to load or generate your certificate.");
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    loadCertificate();
    return () => {
      isActive = false;
    };
  }, [courseId]);

  if (isLoading) {
    return <section className="certificate_page"><div className="certificate_container"><p role="status">Loading certificate…</p></div></section>;
  }

  if (error || !certificate || !course) {
    return (
      <section className="certificate_page">
        <div className="certificate_container">
          <div className="certificate_card certificate_error">
            <h1>{error ? "Certificate unavailable" : "Certificate not found"}</h1>
            <p>{error || "A certificate could not be loaded for this course."}</p>
            <Link to="/my-learning" className="learning_button">Back to My Learning</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="certificate_page">
      <div className="certificate_container">
        <div className="certificate_card">
          <div className="certificate_border">
            <div className="certificate_topline">
              <span className="certificate_brand_mark" aria-hidden="true">L</span>
              <p className="certificate_small_title">LEARNHUB ACADEMY</p>
              <span className="certificate_award_label">CERTIFICATE OF ACHIEVEMENT</span>
            </div>
            <div className="certificate_rule" aria-hidden="true"><span>✦</span></div>
            <p className="certificate_text">This certificate is proudly presented to</p>
            <h2 className="certificate_student_name">{user?.full_name || user?.name || "LearnHub Student"}</h2>
            <p className="certificate_text certificate_completion_text">
              for successfully completing all lessons in
            </p>
            <h1 className="certificate_course_title">{course.title}</h1>
            <p className="certificate_description">
              In recognition of the dedication, curiosity, and commitment demonstrated throughout this learning journey.
            </p>
            <div className="certificate_footer">
              <div className="certificate_signoff">
                <p className="signature">LearnHub</p>
                <span>Learning Platform</span>
              </div>
              <div className="certificate_seal" aria-label="Course completed">
                <span aria-hidden="true">✓</span>
                <small>COURSE<br />COMPLETED</small>
              </div>
              <div className="certificate_issue">
                <p className="certificate_date">{formatDate(certificate.issued_at)}</p>
                <span>Date of Issue</span>
              </div>
            </div>
            <div className="certificate_id">
              <span>Certificate ID</span>
              <strong>{certificate.certificate_id}</strong>
            </div>
          </div>
        </div>
        <div className="certificate_actions">
          <button className="print_button" onClick={() => window.print()}>
            <span aria-hidden="true">↓</span> Download / Print Certificate
          </button>
          <Link to="/my-learning" className="learning_button">Back to My Learning</Link>
        </div>
      </div>
    </section>
  );
}
