import { Navigate, useParams } from "react-router-dom";

/**
 * Redirects from legacy /projects/:id URLs to the correct /projeto/:id route
 * This ensures old email links continue to work
 */
export const LegacyProjectRedirect = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  if (!projectId) {
    return <Navigate to="/projects" replace />;
  }
  
  return <Navigate to={`/projeto/${projectId}`} replace />;
};
