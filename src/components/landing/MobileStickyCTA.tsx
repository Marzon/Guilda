import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CORE_APP_URL } from "@/lib/constants";
import { buildCoreAppUrl } from "@/lib/url-utils";
import { useIsMobile } from "@/hooks/use-mobile";

export const MobileStickyCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile();
  const signupUrl = buildCoreAppUrl(CORE_APP_URL, "/auth?view=signup");

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("section");
    if (!hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  if (!isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <a
            href={signupUrl}
            className="block w-full text-center bg-[#F97316] text-white font-bold text-[15px] rounded-xl py-3.5 px-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)] active:scale-[0.98] transition-transform"
          >
            Encontrar meu Sócio →
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
