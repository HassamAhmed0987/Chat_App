import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./sideBar";
import ChatWindow from "./chatWindow";
import ProfilePage from "./profilePage";
import "../index.css";

export default function App() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [currentPage, setCurrentPage] = useState("chat");
    const { user, logout, loading } = useAuth();

    console.log(user);
    

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    // if (!user) {
    //     return <Navigate to="/login" replace />;
    // }

    return (
        <main className="app">
            <section className="chat-layout">
                <Sidebar
                    selectedUser={selectedUser}
                    onSelectUser={(user) => {
                        setSelectedUser(user);
                        setCurrentPage("chat");
                    }}
                    currentUser={user}
                    onOpenProfile={() => setCurrentPage("profile")}
                    onLogout={handleLogout}
                />

                {currentPage === "profile" ? (
                    <ProfilePage
                        user={user}
                        onBack={() => setCurrentPage("chat")}
                    />
                ) : (
                    <ChatWindow user={selectedUser} />
                )}
            </section>
        </main>
    );
}
