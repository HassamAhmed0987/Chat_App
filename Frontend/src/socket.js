import { io } from "socket.io-client";
const API = import.meta.env.VITE_API_URL
const socket = io("http://localhost:3001", {
    autoConnect: false,

    auth: (callback) => {
        callback({
            token: localStorage.getItem("token"),
        });
    },

    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
});

socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error.message);
});

export default socket;
