import { useState, useEffect, useCallback, useRef } from "react";
import { Send, Upload, ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, FileText, X, Save, Paperclip, Loader2, ExternalLink, Link2, Plus, Users, Lightbulb, Wrench, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { AccelerationTask } from "@/hooks/useAccelerationSchedule";
import { AccelerationSubmission } from "@/hooks/useAccelerationProgress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageLightbox } from "@/components/ImageLightbox";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { getToolById } from "@/data/tools-registry";
import { blogArticles } from "@/data/blog-articles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MissionAreaProps {
  task: AccelerationTask | null;
  phaseName?: string;
  phaseColor?: string;
  onSubmit: (content: string, fileUrl?: string) => void;
  onCancelSubmission?: (submissionId: string) => void;
  isSubmitting?: boolean;
  isCancelling?: boolean;
  previousAttempts?: AccelerationSubmission[];
  currentSubmission?: AccelerationSubmission | null;
  isUserAssigned?: boolean;
}

const MAX_ATTACHMENTS = 10;

export const MissionArea = ({ 
  task, 
  phaseName,
  phaseColor = "#6366f1",
  onSubmit,
  onCancelSubmission,
  isSubmitting = false,
  isCancelling = false,
  previousAttempts = [],
  currentSubmission,
  isUserAssigned = true
}: MissionAreaProps) => {
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  
  // Multiple files and links state
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; url: string }[]>([]);
  const [externalLinks, setExternalLinks] = useState<string[]>([]);
  const [newExternalLink, setNewExternalLink] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxFileName, setLightboxFileName] = useState<string | null>(null);

  // Helper to get filename from URL
  const getFileNameFromUrl = (url: string) => {
    try {
      const pathname = new URL(url).pathname;
      const filename = pathname.split('/').pop() || 'arquivo';
      // Remove timestamp prefix if present (e.g., "1234567890_filename.pdf")
      return decodeURIComponent(filename.replace(/^\d+_/, ''));
    } catch {
      return url.length > 40 ? url.substring(0, 40) + '...' : url;
    }
  };

  // Check if URL is an image
  const isImageUrl = (url: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const lowercaseUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowercaseUrl.includes(ext));
  };

  // Open lightbox for image preview
  const openLightbox = (url: string, fileName: string) => {
    setLightboxUrl(url);
    setLightboxFileName(fileName);
    setLightboxOpen(true);
  };

  // Parse file_url from database (handles both old single URL and new JSON array format)
  const parseFileUrls = (fileUrl: string | null): string[] => {
    if (!fileUrl) return [];
    try {
      const parsed = JSON.parse(fileUrl);
      return Array.isArray(parsed) ? parsed : [fileUrl];
    } catch {
      return [fileUrl];
    }
  };

  // Get all current attachments (uploaded files + external links)
  const getAllAttachments = (): string[] => {
    const fileUrls = uploadedFiles.map(f => f.url);
    return [...fileUrls, ...externalLinks];
  };

  const totalAttachments = uploadedFiles.length + externalLinks.length;
  const canAddMore = totalAttachments < MAX_ATTACHMENTS;

  // Attachment preview component with inline image support
  const AttachmentPreview = ({ url, compact = false, onRemove }: { url: string; compact?: boolean; onRemove?: () => void }) => {
    const fileName = getFileNameFromUrl(url);
    const isImage = isImageUrl(url);
    
    if (isImage) {
      return (
        <div className="relative group">
          <div 
            className="cursor-pointer"
            onClick={() => openLightbox(url, fileName)}
          >
            <div className={cn(
              "relative inline-block rounded-lg overflow-hidden border border-slate-200 bg-white",
              compact ? "max-w-[100px]" : "max-w-[140px]"
            )}>
              <img 
                src={url} 
                alt={fileName}
                className={cn(
                  "max-w-full object-contain transition-opacity group-hover:opacity-90",
                  compact ? "max-h-16" : "max-h-24"
                )}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center transition-colors">
                <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" />
              </div>
            </div>
            <p className={cn(
              "text-slate-500 mt-1 truncate",
              compact ? "text-[9px] max-w-[100px]" : "text-[10px] max-w-[140px]"
            )}>{fileName}</p>
          </div>
          {onRemove && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="relative group">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-1.5 text-blue-600 hover:underline p-2 bg-white border border-slate-200 rounded-lg",
            compact ? "text-xs" : "text-sm"
          )}
        >
          <Paperclip className="w-3.5 h-3.5 flex-shrink-0" />
          <span className={cn("truncate", compact ? "max-w-[80px]" : "max-w-[120px]")}>{fileName}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
        {onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  // Multiple attachments preview component
  const MultipleAttachmentsPreview = ({ fileUrl, compact = false }: { fileUrl: string; compact?: boolean }) => {
    const urls = parseFileUrls(fileUrl);
    if (urls.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2">
        {urls.map((url, index) => (
          <AttachmentPreview key={index} url={url} compact={compact} />
        ))}
      </div>
    );
  };

  // Handle multiple file uploads
  const handleFileUpload = async (files: FileList) => {
    const remainingSlots = MAX_ATTACHMENTS - totalAttachments;
    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    
    if (filesToUpload.length === 0) {
      toast.error(t("acceleration.mission.maxAttachments", `Máximo de ${MAX_ATTACHMENTS} anexos permitido.`));
      return;
    }
    
    setIsUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId || !task) throw new Error('Missing user or task');
      
      const uploadedResults: { file: File; url: string }[] = [];
      
      for (const file of filesToUpload) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(t("acceleration.mission.fileTooLarge", `${file.name}: Arquivo muito grande. Máximo 50MB.`));
          continue;
        }
        
        const fileName = `${userId}/${task.id}/${Date.now()}_${file.name}`;
        
        const { error } = await supabase.storage
          .from('acceleration-files')
          .upload(fileName, file);
        
        if (error) {
          console.error('Upload error for', file.name, error);
          toast.error(`Erro ao enviar ${file.name}`);
          continue;
        }
        
        const { data: urlData } = supabase.storage
          .from('acceleration-files')
          .getPublicUrl(fileName);
        
        uploadedResults.push({ file, url: urlData.publicUrl });
      }
      
      if (uploadedResults.length > 0) {
        setUploadedFiles(prev => [...prev, ...uploadedResults]);
        toast.success(t("acceleration.mission.uploadSuccess", `${uploadedResults.length} arquivo(s) enviado(s)!`));
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(t("acceleration.mission.uploadError", "Erro ao fazer upload"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Remove uploaded file
  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Add external link
  const addExternalLink = () => {
    const trimmedLink = newExternalLink.trim();
    if (!trimmedLink) return;
    
    if (!canAddMore) {
      toast.error(t("acceleration.mission.maxAttachments", `Máximo de ${MAX_ATTACHMENTS} anexos permitido.`));
      return;
    }
    
    // Basic URL validation
    try {
      new URL(trimmedLink);
    } catch {
      // If not a valid URL, try adding https://
      if (!trimmedLink.startsWith('http')) {
        try {
          new URL('https://' + trimmedLink);
          setExternalLinks(prev => [...prev, 'https://' + trimmedLink]);
          setNewExternalLink("");
          return;
        } catch {
          toast.error(t("acceleration.mission.invalidUrl", "URL inválida"));
          return;
        }
      }
      toast.error(t("acceleration.mission.invalidUrl", "URL inválida"));
      return;
    }
    
    setExternalLinks(prev => [...prev, trimmedLink]);
    setNewExternalLink("");
  };

  // Remove external link
  const removeExternalLink = (index: number) => {
    setExternalLinks(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all attachments
  const clearAllAttachments = () => {
    setUploadedFiles([]);
    setExternalLinks([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Draft key for localStorage
  const getDraftKey = useCallback(() => {
    return task ? `acceleration_draft_${task.id}` : null;
  }, [task]);

  // Load draft from localStorage when task changes
  useEffect(() => {
    const key = getDraftKey();
    if (!key) return;
    
    const savedDraft = localStorage.getItem(key);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.content) setContent(draft.content);
        if (draft.externalLinks) setExternalLinks(draft.externalLinks);
        // Note: uploaded files can't be restored from draft (File objects aren't serializable)
        setHasDraft(true);
      } catch (e) {
        localStorage.removeItem(key);
      }
    } else {
      setContent("");
      setExternalLinks([]);
      setUploadedFiles([]);
      setHasDraft(false);
    }
    setDraftSaved(false);
  }, [getDraftKey]);

  // Save draft to localStorage
  const handleSaveDraft = () => {
    const key = getDraftKey();
    if (!key) return;
    
    const draft = {
      content: content,
      externalLinks: externalLinks,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(draft));
    setHasDraft(true);
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 2000);
  };

  // Clear draft from localStorage
  const clearDraft = () => {
    const key = getDraftKey();
    if (key) {
      localStorage.removeItem(key);
      setHasDraft(false);
    }
  };

  const handleCancelSubmission = () => {
    if (currentSubmission && onCancelSubmission) {
      onCancelSubmission(currentSubmission.id);
      setShowCancelDialog(false);
    }
  };

  const handleSubmit = () => {
    if (!content.trim() && task?.deliverable_format === 'text') return;
    
    const allAttachments = getAllAttachments();
    
    // For URL format, at least one attachment is required
    if (allAttachments.length === 0 && task?.deliverable_format === 'url') return;
    if (!content.trim() && task?.deliverable_format === 'both') return;
    
    let submissionContent = content;
    let submissionFileUrl: string | undefined = undefined;
    
    if (task?.deliverable_format === 'url') {
      // For URL format, store attachments as content and file_url
      submissionContent = allAttachments[0] || '';
      if (allAttachments.length > 1) {
        submissionFileUrl = JSON.stringify(allAttachments);
      }
    } else if (task?.deliverable_format === 'file') {
      submissionFileUrl = allAttachments.length > 0 
        ? (allAttachments.length === 1 ? allAttachments[0] : JSON.stringify(allAttachments))
        : undefined;
    } else if (task?.deliverable_format === 'both') {
      submissionFileUrl = allAttachments.length > 0 
        ? (allAttachments.length === 1 ? allAttachments[0] : JSON.stringify(allAttachments))
        : undefined;
    }
    
    onSubmit(submissionContent, submissionFileUrl);
    clearDraft();
    setContent("");
    clearAllAttachments();
  };

  const canSaveDraft = () => {
    if (currentSubmission?.status === 'PENDING') return false;
    const hasAttachments = totalAttachments > 0;
    if (task?.deliverable_format === 'text') return content.trim().length > 0;
    if (task?.deliverable_format === 'url') return hasAttachments;
    if (task?.deliverable_format === 'file') return hasAttachments;
    if (task?.deliverable_format === 'both') return content.trim().length > 0 || hasAttachments;
    return false;
  };

  const canSubmit = () => {
    if (isSubmitting) return false;
    if (currentSubmission?.status === 'PENDING') return false;
    const hasAttachments = totalAttachments > 0;
    if (task?.deliverable_format === 'text') return content.trim().length > 0;
    if (task?.deliverable_format === 'url') return hasAttachments;
    if (task?.deliverable_format === 'file') return hasAttachments;
    if (task?.deliverable_format === 'both') return content.trim().length > 0;
    return false;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  // Attachments section component
  const AttachmentsSection = ({ disabled = false }: { disabled?: boolean }) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-slate-600">
          {t("acceleration.mission.attachments", "Anexos")} 
          <span className="text-slate-400 ml-1">
            ({totalAttachments}/{MAX_ATTACHMENTS})
          </span>
        </label>
        {totalAttachments > 0 && (
          <button
            onClick={clearAllAttachments}
            disabled={disabled}
            className="text-xs text-red-500 hover:text-red-600 disabled:opacity-50"
          >
            {t("acceleration.mission.clearAll", "Limpar todos")}
          </button>
        )}
      </div>
      
      {/* Current attachments grid */}
      {totalAttachments > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          {uploadedFiles.map((item, index) => (
            <div key={`file-${index}`} className="relative">
              {item.file.type.startsWith('image/') ? (
                <div className="relative group">
                  <div 
                    className="cursor-pointer"
                    onClick={() => openLightbox(item.url, item.file.name)}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white">
                      <img 
                        src={URL.createObjectURL(item.file)} 
                        alt={item.file.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-[9px] text-slate-500 mt-1 truncate max-w-[80px]">{item.file.name}</p>
                  </div>
                  <button
                    onClick={() => removeUploadedFile(index)}
                    disabled={disabled}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="relative group">
                  <div className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-lg">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-xs text-slate-700 truncate max-w-[100px]">{item.file.name}</span>
                  </div>
                  <button
                    onClick={() => removeUploadedFile(index)}
                    disabled={disabled}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          ))}
          
          {externalLinks.map((link, index) => (
            <div key={`link-${index}`} className="relative group">
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 bg-white border border-slate-200 rounded-lg text-xs text-blue-600 hover:underline"
              >
                <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate max-w-[100px]">{getFileNameFromUrl(link)}</span>
              </a>
              <button
                onClick={() => removeExternalLink(index)}
                disabled={disabled}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm disabled:opacity-50"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Add attachments buttons */}
      {canAddMore && (
        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,video/mp4,audio/mpeg"
            disabled={disabled || isUploading}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="h-8 text-xs"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5 mr-1.5" />
            )}
            {isUploading 
              ? t("acceleration.mission.uploading", "Enviando...") 
              : t("acceleration.mission.addFiles", "Adicionar arquivos")}
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-1.5 min-w-0 sm:min-w-[200px] flex-1">
            <Input
              type="url"
              value={newExternalLink}
              onChange={(e) => setNewExternalLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addExternalLink();
                }
              }}
              placeholder={t("acceleration.mission.pasteLinkPlaceholder", "Cole um link aqui...")}
              className="h-8 text-xs font-mono flex-1"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addExternalLink}
              disabled={disabled || !newExternalLink.trim()}
              className="h-8 px-3 w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1 sm:mr-0" />
              <span className="sm:hidden">{t("acceleration.mission.addLink", "Adicionar link")}</span>
            </Button>
          </div>
        </div>
      )}
      
      <p className="text-[10px] text-slate-400">
        {t("acceleration.mission.attachmentHint", "PDF, imagens, Google Docs, Figma, etc. Máximo 50MB por arquivo.")}
      </p>
    </div>
  );

  if (!task) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-600">
          {t("acceleration.mission.noTask", "Nenhuma tarefa disponível")}
        </h3>
        <p className="text-sm text-slate-400 mt-2">
          {t("acceleration.mission.noTaskDescription", "Selecione um dia na timeline para ver a tarefa.")}
        </p>
      </div>
    );
  }

  const isDisabled = currentSubmission?.status === 'PENDING' || isSubmitting;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div 
        className="p-3 sm:p-4 border-b"
        style={{ 
          background: `linear-gradient(135deg, ${phaseColor}15, ${phaseColor}05)`,
          borderColor: `${phaseColor}30`
        }}
      >
        {phaseName && (
          <div 
            className="text-xs font-bold uppercase tracking-wide mb-1"
            style={{ color: phaseColor }}
          >
            {phaseName}
          </div>
        )}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <span 
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold"
            style={{ backgroundColor: phaseColor }}
          >
            {task.day_number}
          </span>
          {task.title}
        </h2>
      </div>

      {/* Task description */}
      <div className="p-3 sm:p-4 border-b border-slate-100">
        <div className="prose prose-sm max-w-none text-slate-600 whitespace-pre-wrap">
          {task.description}
        </div>

        {/* Evaluation criteria */}
        {task.evaluation_criteria && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-amber-50 rounded-lg border border-amber-200">
            <h4 className="text-xs font-bold text-amber-800 uppercase mb-1">
              {t("acceleration.mission.criteria", "Critérios de Avaliação")}
            </h4>
            <p className="text-xs sm:text-sm text-amber-700">{task.evaluation_criteria}</p>
          </div>
        )}

        {/* Recommended Resources */}
        {((task.recommended_tools && task.recommended_tools.length > 0) || 
          (task.recommended_articles && task.recommended_articles.length > 0)) && (
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h4 className="text-xs font-bold text-slate-700 uppercase">
                {t("acceleration.mission.recommendedResources", "Recursos Recomendados")}
              </h4>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              {t("acceleration.mission.resourcesHint", "Use estas ferramentas e conteúdos para completar esta tarefa")}
            </p>
            
            {/* Tools */}
            {task.recommended_tools && task.recommended_tools.length > 0 && (
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wrench className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600">
                    {t("acceleration.mission.tools", "Ferramentas")}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.recommended_tools.map(toolId => {
                    const tool = getToolById(toolId);
                    if (!tool) return null;
                    const Icon = tool.icon;
                    return (
                      <Link 
                        key={toolId}
                        to={tool.path}
                        className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-100 
                                   rounded-lg border border-slate-200 transition-colors group"
                      >
                        <div className={`p-1.5 rounded ${tool.bg}`}>
                          <Icon className={`w-4 h-4 ${tool.color}`} />
                        </div>
                        <span className="text-sm font-medium text-slate-700">
                          {t(`tools.${toolId}.title`, toolId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Articles */}
            {task.recommended_articles && task.recommended_articles.length > 0 && (
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-600">
                    {t("acceleration.mission.articles", "Conteúdos")}
                  </span>
                </div>
                <div className="space-y-2">
                  {task.recommended_articles.map(slug => {
                    const article = blogArticles.find(a => a.slug === slug);
                    if (!article) return null;
                    const currentLang = (localStorage.getItem('language') || 'pt') as 'pt' | 'en' | 'es';
                    const title = article.title[currentLang] || article.title.pt;
                    return (
                      <Link
                        key={slug}
                        to={`/blog/${slug}`}
                        className="flex items-center justify-between p-2 sm:p-3 bg-amber-50 hover:bg-amber-100 
                                   rounded-lg border border-amber-200 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-amber-900 line-clamp-1">
                            {title}
                          </h5>
                          <span className="text-xs text-amber-600">
                            {article.readingTime} min de leitura
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-amber-500 group-hover:text-amber-700 flex-shrink-0 ml-2" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current status banner */}
      {currentSubmission && (
        <div className={cn(
          "px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium",
          currentSubmission.status === 'PENDING' && "bg-yellow-50 text-yellow-800",
          currentSubmission.status === 'APPROVED' && "bg-green-50 text-green-800",
          currentSubmission.status === 'REJECTED' && "bg-red-50 text-red-800"
        )}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              {getStatusIcon(currentSubmission.status)}
              <span className="flex-1">
                {currentSubmission.status === 'PENDING' && t("acceleration.mission.pending", "Submissão enviada, aguardando avaliação...")}
                {currentSubmission.status === 'APPROVED' && t("acceleration.mission.approved", "Tarefa aprovada! Avance para o próximo dia.")}
                {currentSubmission.status === 'REJECTED' && t("acceleration.mission.rejected", "Rejeitada. Leia o feedback e resubmeta.")}
              </span>
            </div>
            
            {/* Cancel button for pending submissions */}
            {currentSubmission.status === 'PENDING' && onCancelSubmission && (
              <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isCancelling}
                    className="text-yellow-700 hover:text-yellow-900 hover:bg-yellow-100"
                  >
                    <X className="w-4 h-4 mr-1" />
                    {isCancelling 
                      ? t("acceleration.mission.cancelling", "Cancelando...") 
                      : t("acceleration.mission.cancel", "Cancelar e Editar")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {t("acceleration.mission.cancelConfirmTitle", "Cancelar submissão?")}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("acceleration.mission.cancelConfirmDescription", 
                        "Sua submissão será removida e você poderá editar e reenviar. Esta ação não pode ser desfeita.")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {t("common.back", "Voltar")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelSubmission}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {t("acceleration.mission.confirmCancel", "Sim, cancelar")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          {/* Attachments preview for current submission */}
          {currentSubmission.file_url && (
            <div className="mt-2 p-2 bg-white/50 rounded-lg">
              <p className="text-xs font-medium mb-1 text-slate-600">
                {t("acceleration.mission.attachedFiles", "Anexos:")}
              </p>
              <MultipleAttachmentsPreview fileUrl={currentSubmission.file_url} />
            </div>
          )}
        </div>
      )}

      {/* Submission area */}
      <div className="p-3 sm:p-4">
        {/* Show "not assigned" message if user is not assigned to this task */}
        {!isUserAssigned && !currentSubmission && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">
              {t("acceleration.mission.notAssigned", "Esta tarefa está atribuída ao seu parceiro")}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {t("acceleration.mission.notAssignedHint", "Você pode acompanhar o progresso, mas não precisa entregar.")}
            </p>
          </div>
        )}

        {/* Regular submission area - show if user is assigned or there's already a submission */}
        {(isUserAssigned || currentSubmission) && (
          <>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Send className="w-4 h-4" />
              {currentSubmission?.status === 'REJECTED' 
                ? t("acceleration.mission.resubmit", "Resubmeter Entrega")
                : t("acceleration.mission.submit", "Submeter Entrega")
              }
            </h3>

        {task.deliverable_format === 'text' && (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t("acceleration.mission.textPlaceholder", "Escreva sua resposta aqui...")}
            className="min-h-[100px] sm:min-h-[150px] mb-3 font-mono text-sm"
            disabled={isDisabled}
          />
        )}

        {task.deliverable_format === 'url' && (
          <div className="mb-3">
            <AttachmentsSection disabled={isDisabled} />
          </div>
        )}

        {task.deliverable_format === 'file' && (
          <div className="mb-3">
            <AttachmentsSection disabled={isDisabled} />
          </div>
        )}

        {task.deliverable_format === 'both' && (
          <div className="space-y-4 mb-3">
            {/* Text area */}
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                {t("acceleration.mission.textResponse", "Resposta em texto")} *
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("acceleration.mission.textPlaceholder", "Escreva sua resposta aqui...")}
                className="min-h-[80px] sm:min-h-[120px] font-mono text-sm"
                disabled={isDisabled}
              />
            </div>
            
            {/* Attachments section */}
            <AttachmentsSection disabled={isDisabled} />
          </div>
        )}

        {/* Draft indicator */}
        {hasDraft && !draftSaved && (
          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 flex items-center gap-2">
            <Save className="w-4 h-4" />
            {t("acceleration.mission.draftLoaded", "Rascunho carregado automaticamente")}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Save draft button */}
          <Button
            onClick={handleSaveDraft}
            disabled={!canSaveDraft()}
            variant="outline"
            className={cn(
              "w-full sm:w-auto sm:flex-shrink-0",
              draftSaved && "bg-green-50 border-green-300 text-green-700"
            )}
          >
            <Save className="w-4 h-4 mr-1" />
            {draftSaved 
              ? t("acceleration.mission.draftSaved", "Salvo!") 
              : t("acceleration.mission.saveDraft", "Salvar")}
          </Button>

          {/* Submit button */}
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className={cn(
              "flex-1 font-bold",
              currentSubmission?.status === 'REJECTED' 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                {t("acceleration.mission.submitting", "Enviando...")}
              </span>
            ) : currentSubmission?.status === 'PENDING' ? (
              t("acceleration.mission.waitingReview", "Aguardando Avaliação...")
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                {t("acceleration.mission.submitButton", "Submeter para Avaliação")}
              </span>
            )}
          </Button>
        </div>
          </>
        )}
      </div>

      {/* Previous attempts */}
      {previousAttempts.length > 0 && (
        <Collapsible open={showHistory} onOpenChange={setShowHistory}>
          <CollapsibleTrigger asChild>
            <button className="w-full px-4 py-3 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500 hover:bg-slate-50 transition-colors">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t("acceleration.mission.previousAttempts", "Tentativas anteriores")} ({previousAttempts.length})
              </span>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="border-t border-slate-100 divide-y divide-slate-100">
              {previousAttempts.map((attempt) => (
                <div key={attempt.id} className="p-4 bg-slate-50">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(attempt.status)}
                    <span className="text-xs text-slate-500">
                      {new Date(attempt.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-2">
                    {attempt.content}
                  </p>
                  {attempt.file_url && (
                    <div className="mb-2">
                      <MultipleAttachmentsPreview fileUrl={attempt.file_url} compact />
                    </div>
                  )}
                  {attempt.ai_feedback && (
                    <div className="text-xs text-slate-500 bg-white p-2 rounded border">
                      <strong>Feedback:</strong> {attempt.ai_feedback}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={lightboxUrl || ''}
        fileName={lightboxFileName}
      />
    </div>
  );
};
