
import { ArrowLeft, Mail, UserRound, ShieldCheck } from "lucide-react";

export default function ProfilePage({ user, onBack }) {
  return (
    <section className="profile-page">
      <header className="profile-header">
        <button
          className="icon-button back-button"
          onClick={onBack}
          aria-label="Back to chat"
        >
          <ArrowLeft size={21} />
        </button>

        <div>
          <h2>My Profile</h2>
          <p>Manage your account information</p>
        </div>
      </header>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <h2>{user.name}</h2>
          <p className="profile-subtitle">Chat App member</p>

          <div className="profile-divider" />

          <div className="profile-detail">
            <div className="detail-icon">
              <UserRound size={20} />
            </div>
            <div>
              <span>Full name</span>
              <strong>{user.name}</strong>
            </div>
          </div>

          <div className="profile-detail">
            <div className="detail-icon">
              <Mail size={20} />
            </div>
            <div>
              <span>Email address</span>
              <strong>{user.email}</strong>
            </div>
          </div>

          <div className="profile-detail">
            <div className="detail-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span>Account status</span>
              <strong className="verified-status">Active</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
