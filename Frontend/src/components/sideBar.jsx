
import {
  Search,
  MessageCircle,
  UserRound,
  LogOut,
  Settings,
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../api/users.Api";

export default function Sidebar({
  selectedUser,
  onSelectUser,
  currentUser,
  onOpenProfile,
  onLogout,
}) {

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
    enabled: !!currentUser,
  });

  const users = data?.data || [];

  return (
    <aside className="sidebar">

      <header className="sidebar-header">
        <div className="brand">
          <div className="brand-icon">
            <MessageCircle size={23} />
          </div>

          <div>
            <h2>Chat App</h2>
            <p>Real-time messaging</p>
          </div>
        </div>
      </header>

      <div className="search-box">
        <Search size={18} />
        <input placeholder="Search users..." />
      </div>

      <div className="user-list">
        <div className="section-label">CHATS</div>

        {isLoading && <p>Loading users...</p>}

        {isError && (
          <p className="error-message">
            {error.message || "Failed to load users"}
          </p>
        )}

        {!isLoading && !isError && users.length === 0 && (
          <p>No users found</p>
        )}

        {users.map((user) => (
          <button
            key={user._id}
            className={`user-item ${
              selectedUser?._id === user._id ? "active" : ""
            }`}
            onClick={() => onSelectUser(user)}
          >
            <div className="avatar">
              <UserRound size={22} />
            </div>

            <div className="user-info">
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </button>
        ))}
      </div>

      <footer className="sidebar-footer">
        <div className="avatar small">
          <UserRound size={18} />
        </div>

        <div className="account-info">
          <strong>{currentUser?.name}</strong>
          <p>{currentUser?.email}</p>
        </div>

        <div className="account-actions">
          <button
            className="account-action"
            onClick={onOpenProfile}
            title="My Profile"
            aria-label="My Profile"
          >
            <Settings size={18} />
          </button>

          <button
            className="account-action logout-action"
            onClick={onLogout}
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </footer>

    </aside>
  );
}
