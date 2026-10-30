import api from "./client";

// Get conversation between logged-in user and selected user
export const getConversationApi = async (userId) => {
  const response = await api.get(`/messages/${userId}`);
  return response.data;
};

// Send message
export const sendMessageApi = async ({ receiverId, text }) => {
    const response = await api.post("/messages", {
        receiverId,
        text
    });

    return response.data;
};

