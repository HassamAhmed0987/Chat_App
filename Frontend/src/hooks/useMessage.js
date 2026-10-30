
import { useEffect, useCallback } from "react";

import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";

import { getConversationApi } from "../api/messageApi";
import socket from "../socket";

const useMessages = (userId, currentUserId) => {

    const queryClient = useQueryClient();

    const queryKey = ["messages", userId];


    // 1. Fetch conversation
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey,
        queryFn: () => getConversationApi(userId),
        enabled: !!userId && !!currentUserId,
    });


    // 2. Add message to React Query cache
    const addMessage = useCallback((newMessage) => {

        queryClient.setQueryData(queryKey, (oldData) => {

            if (!oldData) return oldData;

            const exists = oldData.data.some(
                (msg) => String(msg._id) === String(newMessage._id)
            );

            if (exists) return oldData;

            return {
                ...oldData,
                count: oldData.count + 1,
                data: [...oldData.data, newMessage],
            };
        });

    }, [queryClient, userId]);


    // 3. Mark messages as read
    const markMessagesRead = useCallback(() => {

        if (!userId || !currentUserId || !socket.connected) {
            return;
        }

        socket.emit(
            "mark_messages_read",
            {
                senderId: userId,
            },
            (response) => {

                if (!response?.success) {
                    console.error("Read receipt failed:", response?.message);
                    return;
                }

                const readIds = new Set(
                    (response.messageIds || []).map(String)
                );

                if (readIds.size === 0) return;

                queryClient.setQueryData(queryKey, (oldData) => {

                    if (!oldData) return oldData;

                    return {
                        ...oldData,

                        data: oldData.data.map((msg) => {

                            if (readIds.has(String(msg._id))) {
                                return {
                                    ...msg,
                                    isRead: true,
                                    readAt: response.readAt,
                                };
                            }

                            return msg;
                        }),
                    };
                });

            }
        );

    }, [userId, currentUserId, queryClient]);


    // 4. Send message using Socket.IO
    const sendMutation = useMutation({

        mutationFn: ({ receiverId, text }) => {

            return new Promise((resolve, reject) => {

                if (!socket.connected) {
                    return reject(
                        new Error("Socket is not connected")
                    );
                }

                socket.timeout(10000).emit(
                    "send_message",
                    {
                        receiverId,
                        text,
                    },
                    (timeoutError, response) => {

                        if (timeoutError) {
                            return reject(
                                new Error("Message request timed out")
                            );
                        }

                        if (!response?.success) {
                            return reject(
                                new Error(
                                    response?.message || "Message failed"
                                )
                            );
                        }

                        resolve(response.data);
                    }
                );

            });
        },

        onSuccess: (message) => {
            addMessage(message);
        },

    });


    const sendMessage = (text) => {

        return sendMutation.mutateAsync({
            receiverId: userId,
            text,
        });

    };


    // 5. Socket events
    useEffect(() => {

        if (!userId || !currentUserId) return;


        // Incoming message
        const handleReceiveMessage = (message) => {

            const isCurrentConversation =
                String(message.sender?._id || message.sender) === String(userId) &&
                String(message.receiver?._id || message.receiver) === String(currentUserId);

            if (!isCurrentConversation) return;

            addMessage(message);

            // Automatically mark incoming message as read
            markMessagesRead();

        };


        // Sender receives read confirmation
        const handleMessagesRead = (data) => {

            const readIds = new Set(
                (data.messageIds || []).map(String)
            );

            queryClient.setQueryData(queryKey, (oldData) => {

                if (!oldData) return oldData;

                return {
                    ...oldData,

                    data: oldData.data.map((msg) => {

                        if (readIds.has(String(msg._id))) {

                            return {
                                ...msg,
                                isRead: true,
                                readAt: data.readAt,
                            };

                        }

                        return msg;

                    }),
                };

            });

        };


        // Mark unread messages when socket connects
        const handleConnect = () => {
            markMessagesRead();
        };


        socket.on("receive_message", handleReceiveMessage);
        socket.on("messages_read", handleMessagesRead);
        socket.on("connect", handleConnect);


        // Already connected
        if (socket.connected) {
            markMessagesRead();
        }


        return () => {

            socket.off("receive_message", handleReceiveMessage);
            socket.off("messages_read", handleMessagesRead);
            socket.off("connect", handleConnect);

        };

    }, [
        userId,
        currentUserId,
        addMessage,
        markMessagesRead,
        queryClient,
    ]);


    // 6. Mark existing messages as read after fetching conversation
    useEffect(() => {

        if (data?.success && socket.connected) {
            markMessagesRead();
        }

    }, [data?.success, markMessagesRead]);


    return {

        messages: data?.data || [],

        loading: isLoading,

        isError,

        error,

        sending: sendMutation.isPending,

        sendMessage,

        refetch,

    };

};

export default useMessages;
