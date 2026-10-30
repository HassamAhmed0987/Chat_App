
import { useState, useEffect, useRef } from "react";
import {
    MessageCircle,
    Send,
    Paperclip,
    Check,
    CheckCheck
} from "lucide-react";

import { useAuth } from "../context/authContext";
import useMessages from "../hooks/useMessage";

export default function ChatWindow({ user }) {

    const [text, setText] = useState("");

    const messagesEndRef = useRef(null);

    const { user: currentUser } = useAuth();

    const currentUserId = currentUser?.id || currentUser?._id;

    const {
        messages,
        loading,
        sending,
        error,
        sendMessage,
    } = useMessages(
        user?._id,
        currentUser?.id || currentUser?._id
    );


    // Auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });
    }, [messages]);


    // Send message
    const handleSend = async (e) => {
        e.preventDefault();

        if (!text.trim() || sending) return;

        try {
            await sendMessage(text);
            setText("");
        } catch (err) {
            console.error("Message send failed:", err);
        }
    };


    // Format time
    const formatTime = (date) => {
        if (!date) return "";

        return new Date(date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };


    // Empty chat
    if (!user) {
        return (
            <section className="empty-chat">
                <div className="empty-icon">
                    <MessageCircle size={42} />
                </div>

                <h2>Your messages, all in one place</h2>

                <p>Select a user from the left to start chatting.</p>
            </section>
        );
    }


    return (
        <section className="chat-window">

            {/* Header */}
            <header className="chat-header">

                <div className="avatar">
                    {user.name?.charAt(0).toUpperCase()}
                </div>

                {/* <div>
                    <h3>{user.name}</h3>

                    {peerStatus?.isOnline ? (
                        <p className="online-status">
                            <span className="status-dot online"></span>
                            Online
                        </p>
                    ) : (
                        <p className="offline-status">
                            <span className="status-dot offline"></span>

                            {peerStatus?.lastSeen
                                ? `Last seen ${formatTime(peerStatus.lastSeen)}`
                                : "Offline"}
                        </p>
                    )}

                </div> */}

            </header>


            {/* Messages */}
            <div className="messages-area">

                {loading && messages.length === 0 && (
                    <p className="loading-messages">
                        Loading messages...
                    </p>
                )}

                {error && (
                    <p className="error-message">
                        {error.message || "Something went wrong"}
                    </p>
                )}

                {!loading && messages.length === 0 && (
                    <div className="chat-placeholder">
                        <MessageCircle size={32} />

                        <p>
                            Your conversation with {user.name} starts here.
                        </p>
                    </div>
                )}


                {messages.map((msg) => {

                    const senderId =
                        msg.sender?._id || msg.sender;

                    const isMine =
                        String(senderId) === String(currentUserId);

                    return (
                        <div
                            key={msg._id}
                            className={`message-row ${isMine ? "my-message" : "other-message"
                                }`}
                        >

                            <div className="message-content">

                                <span className="message-sender">
                                    {isMine ? "You" : user.name}
                                </span>

                                <div className="message-bubble">

                                    <p>{msg.text}</p>

                                    <span className="message-time">
                                        {formatTime(msg.createdAt)}
                                    </span>

                                    {isMine && (
                                        <span className="message-status">

                                            {msg.isRead ? (
                                                <CheckCheck
                                                    size={15}
                                                    color="#3B82F6"
                                                />
                                            ) : (
                                                <Check
                                                    size={15}
                                                    color="gray"
                                                />
                                            )}

                                        </span>
                                    )}

                                </div>

                            </div>

                        </div>
                    );
                })}

                <div ref={messagesEndRef} />

            </div>


            {/* Input */}
            <form
                className="message-form"
                onSubmit={handleSend}
            >

                <button
                    type="button"
                    className="icon-button"
                    aria-label="Attach file"
                >
                    <Paperclip size={21} />
                </button>

                <input
                    type="text"
                    placeholder={`Message ${user.name}...`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <button
                    type="submit"
                    className="send-button"
                    disabled={!text.trim() || sending}
                    aria-label="Send message"
                >
                    <Send size={19} />
                </button>

            </form>

        </section>
    );
}
