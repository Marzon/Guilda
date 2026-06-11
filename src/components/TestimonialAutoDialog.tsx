import { useEffect, useState } from "react";
import { useTestimonialRequests } from "@/hooks/useTestimonialRequests";
import { TestimonialRequestDialog } from "./TestimonialRequestDialog";

/**
 * Auto-shows testimonial request dialog when user has a pending request
 * Should be placed in a layout component that renders for authenticated users
 */
export function TestimonialAutoDialog() {
  const { pendingRequest, loadingPending } = useTestimonialRequests();
  const [open, setOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Show dialog automatically when there's a pending request
    // Only show once per session
    if (pendingRequest && !loadingPending && !hasShown) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setOpen(true);
        setHasShown(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [pendingRequest, loadingPending, hasShown]);

  if (!pendingRequest) return null;

  return (
    <TestimonialRequestDialog
      request={pendingRequest}
      open={open}
      onOpenChange={setOpen}
    />
  );
}
