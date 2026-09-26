import { useState } from "react";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("learnhubUser");
    return savedUser ? JSON.parse(savedUser) : { name: "LearnHub Student", email: "student@example.com" };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const enrolledCourse = localStorage.getItem("enrolledCourse");
  const courseCompleted = localStorage.getItem("pythonCourseCompleted") === "true";
  const courseCount = enrolledCourse ? 1 : 0;
  const certificateCount = courseCompleted ? 1 : 0;
  const handleSave = (event) => {
    event.preventDefault();
    if (name.trim() === "" || email.trim() === "") { alert("Please fill in all fields."); return; }
    const updatedUser = { ...user, name: name.trim(), email: email.trim() };
    localStorage.setItem("learnhubUser", JSON.stringify(updatedUser));
    setUser(updatedUser); setIsEditing(false); alert("Profile updated successfully!");
  };
  const handleCancel = () => { setName(user.name); setEmail(user.email); setIsEditing(false); };
  return (
    <section className="profile_page"><div className="profile_container"><div className="profile_card">
      <div className="profile_avatar">{user.name.charAt(0).toUpperCase()}</div>
      {!isEditing ? <><h1>{user.name}</h1><p className="profile_role">LearnHub Student</p>
        <div className="profile_info"><div className="profile_item"><span>Email</span><strong>{user.email}</strong></div><div className="profile_item"><span>Status</span><strong>Active Student</strong></div></div>
        <div className="profile_stats"><div><strong>{courseCount}</strong><span>Courses</span></div><div><strong>{certificateCount}</strong><span>Certificates</span></div></div>
        <button className="edit_profile_button" onClick={() => setIsEditing(true)}>Edit Profile</button></> : <form className="edit_profile_form" onSubmit={handleSave}>
        <h1>Edit Profile</h1><div className="profile_form_group"><label>Full Name</label><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" /></div>
        <div className="profile_form_group"><label>Email Address</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email" /></div>
        <div className="profile_edit_buttons"><button type="submit" className="save_profile_button">Save Changes</button><button type="button" className="cancel_profile_button" onClick={handleCancel}>Cancel</button></div>
      </form>}
    </div></div></section>
  );
}
