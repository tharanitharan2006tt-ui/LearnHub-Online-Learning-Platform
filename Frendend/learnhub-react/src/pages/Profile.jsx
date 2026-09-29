import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import "./Profile.css";

export default function Profile() {
  const { setUser: setAuthUser } = useAuth();
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("learnhubUser");
    const parsedUser = savedUser ? JSON.parse(savedUser) : null;
    const name = parsedUser?.name || parsedUser?.full_name || "LearnHub Student";
    return {
      ...parsedUser,
      name,
      email: parsedUser?.email || "student@example.com",
    };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [courseCount, setCourseCount] = useState(0);
  const [certificateCount, setCertificateCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    Promise.all([api.getProfile(), api.getMyLearning(), api.getCertificates()])
      .then(([profile, enrollments, certificates]) => {
        if (!isActive) return;
        const currentUser = {
          id: profile.id,
          email: profile.email,
          name: profile.full_name,
          full_name: profile.full_name,
        };
        setUser(currentUser);
        setName(currentUser.name);
        setEmail(currentUser.email);
        localStorage.setItem("learnhubUser", JSON.stringify(currentUser));
        setAuthUser(currentUser);
        setCourseCount(enrollments.length);
        setCertificateCount(certificates.length);
      })
      .catch((requestError) => {
        if (isActive) setError(requestError.message || "Unable to load your profile.");
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [setAuthUser]);

  const handleSave = async (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please fill in your name and email address.");
      return;
    }

    setError("");
    setIsSaving(true);
    try {
      const profile = await api.updateProfile({
        full_name: name.trim(),
        email: email.trim(),
      });
      const updatedUser = {
        id: profile.id,
        email: profile.email,
        name: profile.full_name,
        full_name: profile.full_name,
      };
      localStorage.setItem("learnhubUser", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setAuthUser(updatedUser);
      setIsEditing(false);
    } catch (requestError) {
      setError(requestError.message || "Unable to save your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setEmail(user.email);
    setError("");
    setIsEditing(false);
  };

  return (
    <section className="profile_page">
      <div className="profile_container">
        <header className="profile_header">
          <span className="profile_eyebrow">YOUR ACCOUNT</span>
          <h1>Profile settings</h1>
          <p>Manage your personal information and learning account.</p>
        </header>

        {error && <p className="profile_error" role="alert">{error}</p>}
        {isLoading ? (
          <p className="profile_loading" role="status">Loading your profile…</p>
        ) : (
        <div className="profile_layout">
          <aside className="profile_summary">
            <div className="profile_avatar" aria-hidden="true">
              {user.name.trim().charAt(0).toUpperCase()}
            </div>
            <h2>{user.name}</h2>
            <p className="profile_role">LearnHub Student</p>
            <span className="profile_active_badge"><span aria-hidden="true" /> Active account</span>
            <div className="profile_summary_divider" />
            <p className="profile_summary_note">Your learning journey, all in one place.</p>
          </aside>

          <div className="profile_card">
            {!isEditing ? (
              <>
                <div className="profile_section_heading">
                  <div>
                    <span className="profile_eyebrow">PERSONAL DETAILS</span>
                    <h2>Account information</h2>
                  </div>
                  <button className="edit_profile_button" type="button" onClick={() => setIsEditing(true)}>
                    Edit profile
                  </button>
                </div>

                <div className="profile_info">
                  <div className="profile_item">
                    <span>Full name</span>
                    <strong>{user.name}</strong>
                  </div>
                  <div className="profile_item">
                    <span>Email address</span>
                    <strong>{user.email}</strong>
                  </div>
                  <div className="profile_item">
                    <span>Account status</span>
                    <strong className="profile_status_value">Active student</strong>
                  </div>
                </div>

                <div className="profile_stats">
                  <div><strong>{courseCount}</strong><span>Courses enrolled</span></div>
                  <div><strong>{certificateCount}</strong><span>Certificates earned</span></div>
                </div>
              </>
            ) : (
              <form className="edit_profile_form" onSubmit={handleSave}>
                <div className="profile_section_heading profile_edit_heading">
                  <div>
                    <span className="profile_eyebrow">UPDATE YOUR DETAILS</span>
                    <h2>Edit profile</h2>
                  </div>
                </div>

                <div className="profile_form_group">
                  <label htmlFor="profile-name">Full name</label>
                  <input
                    id="profile-name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="profile_form_group">
                  <label htmlFor="profile-email">Email address</label>
                  <input
                    id="profile-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div className="profile_edit_buttons">
                  <button type="submit" className="save_profile_button" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save changes"}
                  </button>
                  <button type="button" className="cancel_profile_button" onClick={handleCancel} disabled={isSaving}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
