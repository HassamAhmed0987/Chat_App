
import { MessageCircle, Send, Paperclip } from "lucide-react";
import { useAuth } from "../context/authContext";

// Component ke andar:

export default function ChatWindow({ user }) {
    
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
            <header className="chat-header">
                <div className="avatar">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3>{user.name}</h3>
                    <p>{user.email}</p>
                </div>
            </header>

            <div className="messages-area">
                <div className="chat-placeholder">
                    <MessageCircle size={32} />
                    <p>Your conversation with {user.name} starts here.</p>
                </div>
            </div>

            <form className="message-form" onSubmit={(e) => e.preventDefault()}>
                <button type="button" className="icon-button" aria-label="Attach file">
                    <Paperclip size={21} />
                </button>

                <input
                    type="text"
                    placeholder={`Message ${user.name}...`}
                />

                <button type="submit" className="send-button" aria-label="Send message">
                    <Send size={19} />
                </button>
            </form>
        </section>
    );
}
