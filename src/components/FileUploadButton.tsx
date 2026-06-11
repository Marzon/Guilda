import { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface FileUploadButtonProps {
  conversationId: string;
  onFileSelected: (file: File, previewUrl: string | null) => void;
  disabled?: boolean;
}

export interface FileUploadButtonRef {
  clearSelection: () => void;
}

export const FileUploadButton = forwardRef<FileUploadButtonRef, FileUploadButtonProps>(
  ({ conversationId, onFileSelected, disabled }, ref) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande! Máximo 10MB');
        return;
      }

      // Create preview for images
      let previewUrl: string | null = null;
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);
      }

      setSelectedFile(file);
      onFileSelected(file, previewUrl);
    };

    const clearSelection = () => {
      setSelectedFile(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    // Expose clearSelection to parent component
    useImperativeHandle(ref, () => ({
      clearSelection,
    }));

    return (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
          className="hidden"
          disabled={disabled || isUploading}
        />
        
        {selectedFile ? (
          <div className="flex items-center gap-2 glass px-3 py-2 rounded-lg">
            <span className="text-sm truncate max-w-[150px]">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={disabled || isUploading}
            title="Enviar arquivo"
            className="relative z-50"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Paperclip className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    );
  }
);

FileUploadButton.displayName = 'FileUploadButton';
