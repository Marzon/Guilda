import { Navigate, useParams } from "react-router-dom";

export const ProfileRedirect = () => {
  const { userId } = useParams<{ userId: string }>();
  return <Navigate to={`/u/${userId}`} replace />;
};
