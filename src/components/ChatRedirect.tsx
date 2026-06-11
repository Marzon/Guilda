import { Navigate, useParams } from "react-router-dom";

export const ChatRedirect = () => {
  const { recipientId } = useParams<{ recipientId: string }>();
  
  return (
    <Navigate 
      to="/messages" 
      state={{ openChatWithUserId: recipientId }} 
      replace 
    />
  );
};
