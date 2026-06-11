import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useLanguage } from "@/hooks/useLanguage";

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName?: string | null;
}

export const ImageLightbox = ({ isOpen, onClose, imageUrl, fileName }: ImageLightboxProps) => {
  const { t } = useLanguage();
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = fileName || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        <VisuallyHidden>
          <DialogTitle>{t('lightbox.viewImage')}</DialogTitle>
          <DialogDescription>{t('lightbox.imageFullscreen')}: {fileName || t('accessibility.image')}</DialogDescription>
        </VisuallyHidden>
        <div className="relative w-full h-full flex items-center justify-center p-4">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-background/20 hover:bg-background/40 text-white"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Download button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 z-50 bg-background/20 hover:bg-background/40 text-white"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5" />
          </Button>

          {/* Image */}
          <img
            src={imageUrl}
            alt={fileName || 'Image'}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* File name */}
          {fileName && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-sm text-foreground font-medium">{fileName}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
