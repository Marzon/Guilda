import { FileText, FileSpreadsheet, File, FileArchive, FileVideo, FileAudio, FileCode, Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import i18n from "@/i18n";

interface FilePreviewProps {
  fileUrl: string;
  fileName: string | null;
  fileType: string | null;
  fileSize?: number | null;
}

const getFileIcon = (fileType: string | null, fileName: string | null) => {
  if (!fileType && !fileName) return File;
  
  const type = fileType?.toLowerCase() || '';
  const name = fileName?.toLowerCase() || '';
  
  // PDF
  if (type.includes('pdf') || name.endsWith('.pdf')) {
    return FileText;
  }
  
  // Excel/Spreadsheets
  if (type.includes('spreadsheet') || type.includes('excel') || 
      name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) {
    return FileSpreadsheet;
  }
  
  // Word/Documents
  if (type.includes('document') || type.includes('word') || 
      name.endsWith('.docx') || name.endsWith('.doc')) {
    return FileText;
  }
  
  // Archives
  if (type.includes('zip') || type.includes('rar') || type.includes('7z') ||
      name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) {
    return FileArchive;
  }
  
  // Video
  if (type.includes('video') || name.match(/\.(mp4|avi|mov|mkv|webm)$/)) {
    return FileVideo;
  }
  
  // Audio
  if (type.includes('audio') || name.match(/\.(mp3|wav|ogg|m4a)$/)) {
    return FileAudio;
  }
  
  // Code
  if (type.includes('text') || name.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|html|css|json|xml)$/)) {
    return FileCode;
  }
  
  return File;
};

const getFileColor = (fileType: string | null, fileName: string | null) => {
  const type = fileType?.toLowerCase() || '';
  const name = fileName?.toLowerCase() || '';
  
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'text-red-500';
  if (type.includes('spreadsheet') || type.includes('excel') || name.match(/\.(xlsx?|csv)$/)) return 'text-green-500';
  if (type.includes('document') || type.includes('word') || name.match(/\.docx?$/)) return 'text-blue-500';
  if (type.includes('zip') || type.includes('rar') || name.match(/\.(zip|rar|7z)$/)) return 'text-yellow-500';
  if (type.includes('video')) return 'text-purple-500';
  if (type.includes('audio')) return 'text-pink-500';
  if (type.includes('code') || name.match(/\.(js|jsx|ts|tsx|py|java)$/)) return 'text-orange-500';
  
  return 'text-muted-foreground';
};

const formatFileSize = (bytes: number | null | undefined): string => {
  if (!bytes) return '';
  
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FilePreview = ({ fileUrl, fileName, fileType, fileSize }: FilePreviewProps) => {
  const FileIcon = getFileIcon(fileType, fileName);
  const iconColor = getFileColor(fileType, fileName);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenFile = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error(i18n.t('file.loadError'));
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      // Limpar blob URL após alguns segundos
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      console.error('Erro ao abrir arquivo:', error);
      toast.error(i18n.t('file.openError'));
      // Fallback: tentar abrir URL direta
      window.open(fileUrl, '_blank');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 sm:p-3 sm:gap-3 bg-secondary/20 rounded-lg hover:bg-secondary/30 transition-colors w-full max-w-full">
      <div className={`flex-shrink-0 ${iconColor}`}>
        <FileIcon className="h-6 w-6 sm:h-8 sm:w-8" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium truncate">{fileName || 'Arquivo'}</p>
        {fileSize && (
          <p className="text-[10px] sm:text-xs text-muted-foreground">{formatFileSize(fileSize)}</p>
        )}
      </div>
      
      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleOpenFile}
          disabled={isLoading}
          className="h-8 w-8"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-8 w-8"
        >
          <a 
            href={fileUrl} 
            download={fileName || 'download'}
          >
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};
