import { Link } from "react-router-dom";
import "./Certificate.css";

export default function Certificate() {
  return (
    <section className="certificate_page">
      <div className="certificate_container">
        <div className="certificate_card">
          <div className="certificate_border">
            <p className="certificate_small_title">LEARNHUB</p>
            <h1>Certificate of Completion</h1>
            <p className="certificate_text">This certificate is proudly presented to</p>
            <h2>Tharanitharan K</h2>
            <p className="certificate_text">for successfully completing the course</p>
            <h3>Python Programming</h3>
            <p className="certificate_description">The learner has successfully completed the required lessons and assessment for this course.</p>
            <div className="certificate_details">
              <div><span>Course</span><strong>Python Programming</strong></div>
              <div><span>Score</span><strong>4 / 5</strong></div>
              <div><span>Status</span><strong>Completed</strong></div>
            </div>
            <div className="certificate_footer">
              <div><p className="signature">LearnHub</p><span>Course Platform</span></div>
              <div><p className="certificate_date">September 2026</p><span>Completion Date</span></div>
            </div>
          </div>
        </div>
        <div className="certificate_actions"><button className="print_button" onClick={() => window.print()}>ðŸ–¨ Print Certificate</button><Link to="/my-learning" className="learning_button">Back to My Learning</Link></div>
      </div>
    </section>
  );
}
