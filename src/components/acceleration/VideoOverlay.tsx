import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { CohortVideo } from "@/hooks/useCohortVideos";
import { cn } from "@/lib/utils";

interface VideoOverlayProps {
  video: CohortVideo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWatched: (videoId: string, completed: boolean, durationSeconds?: number) => void;
  autoPlay?: boolean;
}

export function VideoOverlay({
  video,
  open,
  onOpenChange,
  onWatched,
  autoPlay = true,
}: VideoOverlayProps) {
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Reset state when video changes
  useEffect(() => {
    if (video && open) {
      setHasEnded(false);
      startTimeRef.current = Date.now();
      
      if (autoPlay && videoRef.current) {
        videoRef.current.play().catch(() => {
          // Autoplay blocked, user needs to click play
        });
      }
    }
  }, [video, open, autoPlay]);

  const handleClose = () => {
    if (video) {
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onWatched(video.id, hasEnded, durationSeconds);
    }
    onOpenChange(false);
  };

  const handleVideoEnd = () => {
    setHasEnded(true);
    setIsPlaying(false);
    if (video) {
      const durationSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onWatched(video.id, true, durationSeconds);
    }
  };

  const getDayLabel = (dayNumber: number) => {
    if (dayNumber === 0) return t("acceleration.video.welcome", "Boas-vindas");
    if (dayNumber === 16) return t("acceleration.video.final", "Mensagem Final");
    return t("acceleration.video.dayLabel", "Dia {{day}}").replace("{{day}}", dayNumber.toString());
  };

  // Check if it's a YouTube URL and extract embed URL
  const getVideoEmbedUrl = (url: string) => {
    // YouTube: watch, embed, shorts, youtu.be
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([^&\s?]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }
    // Return as-is for direct video URLs
    return null;
  };

  if (!video) return null;

  const embedUrl = getVideoEmbedUrl(video.video_url);
  const isEmbedVideo = !!embedUrl;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="max-w-[95vw] max-h-[95vh] h-[95vh] w-[95vw] p-0 flex flex-col overflow-hidden bg-black border-none"
        hideCloseButton
      >
        {/* Custom close button - always visible */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
          aria-label={t("common.close", "Fechar")}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Compact header */}
        <DialogHeader className="px-4 py-3 bg-gradient-to-b from-purple-900/50 to-transparent">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span className="text-sm font-medium text-purple-300">
              {getDayLabel(video.day_number)}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold text-white truncate pr-10">
            {video.title}
          </DialogTitle>
          {video.description && (
            <DialogDescription className="text-slate-300 text-sm line-clamp-1">
              {video.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Video container - fills remaining space */}
        <div className="flex-1 relative bg-black overflow-hidden">
          {isEmbedVideo ? (
            <iframe
              src={embedUrl}
              className="w-full h-full object-contain"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={video.video_url}
              className="w-full h-full object-contain"
              controls
              autoPlay={autoPlay}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={handleVideoEnd}
            />
          )}

          {/* Completion overlay */}
          {hasEnded && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <p className="text-white text-lg font-medium mb-4">
                {t("acceleration.video.completed", "Vídeo concluído!")}
              </p>
              <Button
                onClick={handleClose}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {t("acceleration.video.continue", "Continuar")}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Button to rewatch a video
interface VideoRewatchButtonProps {
  video: CohortVideo | null;
  hasWatched: boolean;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function VideoRewatchButton({
  video,
  hasWatched,
  onClick,
  variant = "outline",
  size = "sm",
  className,
}: VideoRewatchButtonProps) {
  const { t } = useLanguage();

  if (!video) return null;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
        "gap-2",
        hasWatched && "text-green-600 border-green-600/50",
        className
      )}
    >
      <Play className="w-4 h-4" />
      {hasWatched 
        ? t("acceleration.video.rewatch", "Rever vídeo")
        : t("acceleration.video.watch", "Assistir vídeo")
      }
      {hasWatched && <CheckCircle className="w-3 h-3 ml-1" />}
    </Button>
  );
}
