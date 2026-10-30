
import { io } from "socket.io-client";
import readline from "node:readline";

const token = process.env.TOKEN;

if (!token) {
  console.error("TOKEN environment variable is required.");
  process.exit(1);
}

const socket = io("http://localhost:3001", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("Connected to chat server:", socket.id);
  console.log("Send a message using:");
  console.log("RECEIVER_ID Your message here");
});

socket.on("connect_error", (error) => {
  console.error("Connection failed:", error.message);
});

socket.on("receive_message", (message) => {
  console.log("\n📩 New message received:");
  console.log("From:", message.sender);
  console.log("Message:", message.text);
  console.log("Time:", message.createdAt);
});

socket.on("message_sent", (message) => {
  console.log("\n✅ Message saved and sent:");
  console.log("Message:", message.text);
  console.log("Message ID:", message._id);
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  const firstSpace = input.indexOf(" ");

  if (firstSpace === -1) {
    console.log("Format: RECEIVER_ID Your message");
    return;
  }

  const receiverId = input.slice(0, firstSpace).trim();
  const text = input.slice(firstSpace + 1).trim();

  socket.emit(
    "send_message",
    { receiverId, text },
    (response) => {
      if (!response.success) {
        console.error("❌", response.message);
      }
    }
  );
});

rl.on("close", () => {
  socket.disconnect();
});
