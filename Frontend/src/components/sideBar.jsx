
import { useState, useEffect } from "react";

import {
  Search,
  MessageCircle,
  UserRound,
  LogOut,
  Settings,
} from "lucide-react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getAllUsers } from "../api/users.Api";
import socket from "../socket";


export default function Sidebar({
  selectedUser,
  onSelectUser,
  currentUser,
  onOpenProfile,
  onLogout,
}) {

  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");

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


  // Listen for online/offline updates
  useEffect(() => {

    const handleUserStatus = (status) => {

      queryClient.setQueryData(["users"], (oldData) => {

        if (!oldData) return oldData;

        return {
          ...oldData,

          data: oldData.data.map((user) => {

            if (String(user._id) === String(status.userId)) {

              return {
                ...user,
                isOnline: status.isOnline,
                lastSeen: status.lastSeen,
              };

            }

            return user;

          }),

        };

      });

    };


    socket.on("user_status", handleUserStatus);

    return () => {
      socket.off("user_status", handleUserStatus);
    };

  }, [queryClient]);


  // Search users
  const filteredUsers = users.filter((user) =>

    user.name?.toLowerCase().includes(search.toLowerCase())

  );


  const formatLastSeen = (date) => {

    if (!date) return "Offline";

    return `Last seen ${new Date(date).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;

  };


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


      {/* Search */}
      <div className="search-box">

        <Search size={18} />

        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>


      {/* Users */}
      <div className="user-list">

        <div className="section-label">
          CHATS
        </div>


        {isLoading && <p>Loading users...</p>}


        {isError && (
          <p className="error-message">
            {error.message || "Failed to load users"}
          </p>
        )}


        {!isLoading && !isError && filteredUsers.length === 0 && (
          <p>No users found</p>
        )}


        {filteredUsers.map((user) => (

          <button
            key={user._id}
            className={`user-item ${
              selectedUser?._id === user._id ? "active" : ""
            }`}
            onClick={() => onSelectUser(user)}
          >

            <div className="avatar-wrapper">

              <div className="avatar">
                <UserRound size={22} />
              </div>

              <span
                className={`status-dot ${
                  user.isOnline ? "online" : "offline"
                }`}
              />

            </div>


            <div className="user-info">

              <h3>{user.name}</h3>

              <p>
                {user.isOnline
                  ? "Online"
                  : formatLastSeen(user.lastSeen)}
              </p>

            </div>

          </button>

        ))}

      </div>


      {/* Footer */}
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
          >
            <Settings size={18} />
          </button>


          <button
            className="account-action logout-action"
            onClick={onLogout}
            title="Logout"
          >
            <LogOut size={18} />
          </button>

        </div>

      </footer>

    </aside>
  );
}
