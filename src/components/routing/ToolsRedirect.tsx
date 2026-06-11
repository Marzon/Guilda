import { Navigate, useLocation } from "react-router-dom";

/**
 * Redirects /tools/* routes to /ferramentas-empreendedores/*
 * This preserves any slug after /tools/ and redirects to the correct path
 */
export const ToolsRedirect = () => {
  const location = useLocation();
  const slug = location.pathname.replace(/^\/tools\/?/, '');
  
  // Direct redirects for tools with custom routes
  const customRoutes: Record<string, string> = {
    'equity-calculator': '/calculadora-de-equity',
  };
  
  const newPath = customRoutes[slug] 
    ?? (slug ? `/ferramentas-empreendedores/${slug}` : '/ferramentas-empreendedores');
  
  return <Navigate to={newPath + location.search + location.hash} replace />;
};
