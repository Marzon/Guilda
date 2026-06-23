import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - escuta mudanças de rota e rola a página para o topo.
 * Deve ser colocado dentro do <BrowserRouter>.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
