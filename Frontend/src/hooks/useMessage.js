
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getConversationApi,
  sendMessageApi,
} from "../api/messageApi";

const useMessages = (userId) => {
  const queryClient = useQueryClient();

  // Fetch conversation
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["messages", userId],
    queryFn: () => getConversationApi(userId),
    enabled: !!userId,
    refetchInterval: 3000,
  });

  // Send message
const sendMutation = useMutation({
    mutationFn: sendMessageApi,

    onSuccess: (response) => {
        queryClient.setQueryData(
            ["messages", userId],
            (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    count: oldData.count + 1,
                    data: [...oldData.data, response.data]
                };
            }
        );
    }
});

const sendMessage = (text) => {
    return sendMutation.mutateAsync({
        receiverId: userId,
        text: text
    });
};

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
