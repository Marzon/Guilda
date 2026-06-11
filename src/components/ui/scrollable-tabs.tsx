import * as React from "react";
import { cn } from "@/lib/utils";

interface ScrollableTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showIndicators?: boolean;
}

export const ScrollableTabs = React.forwardRef<HTMLDivElement, ScrollableTabsProps>(
  ({ children, className, showIndicators = true, ...props }, ref) => {
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = React.useState(false);
    const [showRightFade, setShowRightFade] = React.useState(false);

    const checkScroll = React.useCallback(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftFade(scrollLeft > 10);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    }, []);

    React.useEffect(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      checkScroll();
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);

      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }, [checkScroll]);

    return (
      <div ref={ref} className={cn("relative", className)} {...props}>
        {/* Left fade indicator */}
        {showIndicators && showLeftFade && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10 md:hidden" />
        )}

        {/* Scrollable container */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        >
          {children}
        </div>

        {/* Right fade indicator */}
        {showIndicators && showRightFade && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10 md:hidden" />
        )}
      </div>
    );
  }
);

ScrollableTabs.displayName = "ScrollableTabs";
