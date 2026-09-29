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
            <p className="certificate_small_title">LEARNHUB</p>
            <h1>Certificate of Completion</h1>
            <p className="certificate_text">This certificate is proudly presented to</p>
            <h2>{user?.full_name || user?.name || "LearnHub Student"}</h2>
            <p className="certificate_text">for successfully completing the course</p>
            <h3>{course.title}</h3>
            <p className="certificate_description">
              The learner has successfully completed the required lessons for this course.
            </p>
            <div className="certificate_details">
              <div><span>Course</span><strong>{course.title}</strong></div>
              <div><span>Certificate ID</span><strong>{certificate.certificate_id}</strong></div>
              <div><span>Status</span><strong>Completed</strong></div>
            </div>
            <div className="certificate_footer">
              <div><p className="signature">LearnHub</p><span>Course Platform</span></div>
              <div><p className="certificate_date">{formatDate(certificate.issued_at)}</p><span>Completion Date</span></div>
            </div>
          </div>
        </div>
        <div className="certificate_actions">
          <button className="print_button" onClick={() => window.print()}>🖨 Print Certificate</button>
          <Link to="/my-learning" className="learning_button">Back to My Learning</Link>
        </div>
      </div>
    </section>
  );
}
