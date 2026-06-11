import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { 
  BookOpen, AlertTriangle, Share2, Copy, Check, Filter,
  Trophy, Shield, Sword, Crown, Sparkles, X, Loader2, FileDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToolPageLayout } from '@/components/tools/ToolPageLayout';
import { useAuth } from '@/hooks/useAuth';
import { useBookReads } from '@/hooks/useBookReads';
import { useBookCover } from '@/hooks/useBookCovers';
import { useToolTracking } from '@/hooks/useToolTracking';
import { CANON_BOOKS, CRITICAL_BOOK_RULES, getCategoryColor, getStageColor, CanonBook } from '@/data/canon-books';
import { generateReadingListPDF } from '@/lib/pdf-generator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FilterType = 'all' | 'my-trail' | 'essentials';
type ProjectStage = 'idea' | 'mvp' | 'traction';

interface LevelInfo {
  name: string;
  icon: typeof Trophy;
  color: string;
  bgColor: string;
  minBooks: number;
}

const LEVELS: LevelInfo[] = [
  { name: 'novice', icon: Shield, color: 'text-slate-400', bgColor: 'bg-slate-500/20', minBooks: 0 },
  { name: 'operator', icon: Sword, color: 'text-blue-400', bgColor: 'bg-blue-500/20', minBooks: 6 },
  { name: 'master', icon: Crown, color: 'text-amber-400', bgColor: 'bg-amber-500/20', minBooks: 13 },
];

const KnowledgeRoadmap = () => {
  const { t } = useTranslation();
  const { data: auth } = useAuth();
  const userId = auth?.user?.id;
  const userArchetype = auth?.profile?.archetype || 'BUILDER';
  
  const { booksRead, isLoading, toggleBook, isBookRead, readCount } = useBookReads(userId);
  useToolTracking('knowledge-roadmap');
  
  const [filter, setFilter] = useState<FilterType>('all');
  const [projectStage, setProjectStage] = useState<ProjectStage>('idea');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // Calculate current level
  const currentLevel = useMemo(() => {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (readCount >= LEVELS[i].minBooks) {
        return LEVELS[i];
      }
    }
    return LEVELS[0];
  }, [readCount]);

  // Progress percentage
  const progressPercent = useMemo(() => {
    return Math.round((readCount / CANON_BOOKS.length) * 100);
  }, [readCount]);

  // Get next level info
  const nextLevel = useMemo(() => {
    const currentIndex = LEVELS.findIndex(l => l.name === currentLevel.name);
    return currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;
  }, [currentLevel]);

  // Filter books based on selection
  const filteredBooks = useMemo(() => {
    return CANON_BOOKS.filter(book => {
      if (filter === 'all') return true;
      if (filter === 'my-trail') {
        const role = userArchetype.toLowerCase();
        return book.category === 'universal' || book.category === role;
      }
      if (filter === 'essentials') {
        return book.critical_for_stage === projectStage;
      }
      return true;
    });
  }, [filter, userArchetype, projectStage]);

  // Check for critical gaps
  const criticalGaps = useMemo(() => {
    return CRITICAL_BOOK_RULES.filter(rule => {
      // Check if rule applies to current stage
      if (rule.stage !== projectStage) return false;
      
      // Check if rule applies to user role
      if (rule.role && rule.role !== userArchetype) return false;
      
      // Check if book is not read
      const book = CANON_BOOKS.find(b => b.id === rule.bookId);
      if (!book || isBookRead(rule.bookId)) return false;
      
      // Check if alert was dismissed
      if (dismissedAlerts.includes(rule.alertKey)) return false;
      
      return true;
    });
  }, [projectStage, userArchetype, booksRead, dismissedAlerts, isBookRead]);

  // Dismiss alert
  const dismissAlert = useCallback((alertKey: string) => {
    setDismissedAlerts(prev => [...prev, alertKey]);
  }, []);

  // Generate share text
  const shareText = useMemo(() => {
    const roleName = userArchetype === 'BUILDER' ? 'Builder' : 'Seller';
    const levelName = t(`knowledgeRoadmap.levels.${currentLevel.name}`, currentLevel.name);
    return t('knowledgeRoadmap.shareText', {
      role: roleName,
      level: levelName,
      percent: progressPercent,
      defaultValue: `Sou um ${roleName} Nível ${levelName}. Já dominei ${progressPercent}% do Cânone da Guilda. 📚`
    });
  }, [userArchetype, currentLevel, progressPercent, t]);

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success(t('knowledgeRoadmap.copiedToClipboard', 'Copiado para a área de transferência!'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error(t('knowledgeRoadmap.copyError', 'Erro ao copiar'));
    }
  };

  // Export reading list to PDF
  const exportReadingList = useCallback(() => {
    const levelName = t(`knowledgeRoadmap.levels.${currentLevel.name}`, currentLevel.name);
    
    const translations = {
      title: t('knowledgeRoadmap.export.title', 'Lista de Leitura Personalizada'),
      subtitle: t('knowledgeRoadmap.export.subtitle', 'Ordenada por prioridade'),
      criticalReadings: t('knowledgeRoadmap.export.criticalReadings', 'Leituras Críticas'),
      nextRecommendations: t('knowledgeRoadmap.export.nextRecommendations', 'Próximas Recomendações'),
      progress: t('knowledgeRoadmap.export.progress', 'Progresso'),
      book: t('knowledgeRoadmap.export.book', 'Livro'),
      author: t('knowledgeRoadmap.export.author', 'Autor'),
      stage: t('knowledgeRoadmap.export.stage', 'Estágio'),
      category: t('knowledgeRoadmap.export.category', 'Categoria'),
      footer: t('knowledgeRoadmap.export.footer', 'Gerado por Guilda - guilda.app.br'),
      stages: {
        idea: t('knowledgeRoadmap.stages.idea', 'Ideia'),
        mvp: t('knowledgeRoadmap.stages.mvp', 'MVP'),
        traction: t('knowledgeRoadmap.stages.traction', 'Tração'),
      },
      categories: {
        universal: t('knowledgeRoadmap.export.categories.universal', 'Universal'),
        builder: t('knowledgeRoadmap.export.categories.builder', 'Builder'),
        seller: t('knowledgeRoadmap.export.categories.seller', 'Seller'),
      },
      archetypes: {
        BUILDER: t('archetypes.builderRole', 'Builder'),
        SELLER: t('archetypes.sellerRole', 'Seller'),
      },
    };

    const pdf = generateReadingListPDF(
      {
        userName: auth?.profile?.username || 'Founder',
        userArchetype: userArchetype as 'BUILDER' | 'SELLER',
        currentLevel: levelName,
        projectStage,
        booksRead,
        totalBooks: CANON_BOOKS.length,
        readCount,
        progressPercent,
        translations,
      },
      CANON_BOOKS,
      CRITICAL_BOOK_RULES
    );

    pdf.save(`lista-leitura-${projectStage}-${userArchetype.toLowerCase()}.pdf`);
    toast.success(t('knowledgeRoadmap.export.success', 'Lista de leitura exportada!'));
  }, [t, currentLevel, userArchetype, projectStage, booksRead, readCount, progressPercent, auth?.profile?.username]);

  const LevelIcon = currentLevel.icon;
  return (
    <ToolPageLayout toolId="knowledge-roadmap" icon={BookOpen}>
      <Helmet>
        <title>{t('knowledgeRoadmap.pageTitle', 'Cânone da Execução')} | Guilda</title>
        <meta name="description" content={t('knowledgeRoadmap.pageDescription', 'Biblioteca tática gamificada para fundadores. Descubra lacunas de conhecimento críticas.')} />
        <link rel="canonical" href="https://www.guilda.app.br/ferramentas-empreendedores/knowledge-roadmap" />
      </Helmet>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Critical Gap Alerts */}
        {criticalGaps.map(gap => {
          const book = CANON_BOOKS.find(b => b.id === gap.bookId);
          if (!book) return null;
          
          return (
            <div 
              key={gap.alertKey}
              className="relative bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-4"
            >
              <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-400 mb-1">
                  {t('knowledgeRoadmap.criticalAlert', '🚨 ALERTA CRÍTICO')}
                </h3>
                <p className="text-red-300/80 text-sm">
                  {t(`knowledgeRoadmap.alerts.${gap.alertKey}`, {
                    book: book.title,
                    stage: t(`knowledgeRoadmap.stages.${gap.stage}`),
                    defaultValue: `Você está na fase ${gap.stage} e não leu "${book.title}". Isso é crítico para seu sucesso!`
                  })}
                </p>
              </div>
              <button 
                onClick={() => dismissAlert(gap.alertKey)}
                className="text-red-400/60 hover:text-red-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          );
        })}

        {/* Progress Header */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-xl flex items-center justify-center",
                currentLevel.bgColor
              )}>
                <LevelIcon className={cn("w-8 h-8", currentLevel.color)} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn("text-xl font-bold", currentLevel.color)}>
                    {t(`knowledgeRoadmap.levels.${currentLevel.name}`, currentLevel.name)}
                  </span>
                  {nextLevel && (
                    <Badge variant="outline" className="text-xs">
                      {readCount}/{nextLevel.minBooks} {t('knowledgeRoadmap.forNextLevel', 'para próximo nível')}
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {t('knowledgeRoadmap.consciousnessLevel', 'Nível de Consciência')}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={() => setShareModalOpen(true)}
                variant="outline"
                className="gap-2"
                size="sm"
              >
                <Share2 className="w-4 h-4" />
                {t('knowledgeRoadmap.generateScore', 'Gerar Meu Score')}
              </Button>
              <Button 
                onClick={exportReadingList}
                variant="default"
                className="gap-2"
                size="sm"
              >
                <FileDown className="w-4 h-4" />
                {t('knowledgeRoadmap.exportList', 'Exportar Lista')}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {readCount}/{CANON_BOOKS.length} {t('knowledgeRoadmap.booksRead', 'livros lidos')}
              </span>
              <span className="font-bold text-primary">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* Level Progression - Horizontal scroll on mobile */}
          <div className="flex gap-2 sm:gap-0 sm:justify-between items-center pt-2 overflow-x-auto pb-2 -mx-2 px-2 sm:mx-0 sm:px-0 sm:overflow-visible scrollbar-hide">
            {LEVELS.map((level, index) => {
              const isActive = currentLevel.name === level.name;
              const isCompleted = readCount >= level.minBooks;
              const Icon = level.icon;
              
              return (
                <div key={level.name} className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isActive ? level.bgColor : isCompleted ? "bg-muted" : "bg-muted/50",
                    isActive && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                  )}>
                    <Icon className={cn(
                      "w-5 h-5",
                      isActive ? level.color : isCompleted ? "text-muted-foreground" : "text-muted-foreground/50"
                    )} />
                  </div>
                  <div className="block">
                    <p className={cn(
                      "text-xs font-medium whitespace-nowrap",
                      isActive ? level.color : "text-muted-foreground"
                    )}>
                      {t(`knowledgeRoadmap.levels.${level.name}`, level.name)}
                    </p>
                    <p className="text-xs text-muted-foreground/60 whitespace-nowrap">
                      {level.minBooks}+ {t('knowledgeRoadmap.books', 'livros')}
                    </p>
                  </div>
                  {index < LEVELS.length - 1 && (
                    <div className={cn(
                      "hidden sm:block w-8 h-0.5 mx-2",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            {(['all', 'my-trail', 'essentials'] as FilterType[]).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="gap-2"
              >
                {filterType === 'my-trail' && <Sparkles className="w-4 h-4" />}
                {filterType === 'essentials' && <Filter className="w-4 h-4" />}
                {t(`knowledgeRoadmap.filters.${filterType}`, filterType)}
              </Button>
            ))}
          </div>
          
          {filter === 'essentials' && (
            <Select value={projectStage} onValueChange={(v) => setProjectStage(v as ProjectStage)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="idea">{t('knowledgeRoadmap.stages.idea', 'Ideia')}</SelectItem>
                <SelectItem value="mvp">{t('knowledgeRoadmap.stages.mvp', 'MVP')}</SelectItem>
                <SelectItem value="traction">{t('knowledgeRoadmap.stages.traction', 'Tração')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Book Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id}
              book={book}
              isRead={isBookRead(book.id)}
              onToggle={() => {
                if (!userId) {
                  toast.info(t('knowledgeRoadmap.loginToSave', 'Faça login para salvar seu progresso'));
                  return;
                }
                toggleBook(book.id);
              }}
              disabled={isLoading}
            />
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('knowledgeRoadmap.noBooks', 'Nenhum livro encontrado para este filtro.')}
          </div>
        )}

        {!userId && (
          <div className="bg-muted/50 border border-border rounded-xl p-6 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-bold mb-2">{t('knowledgeRoadmap.loginRequired', 'Faça login para salvar seu progresso')}</h3>
            <p className="text-muted-foreground text-sm">
              {t('knowledgeRoadmap.loginDescription', 'Seus livros lidos serão salvos automaticamente quando você estiver logado.')}
            </p>
          </div>
        )}

        {/* Share Modal */}
        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                {t('knowledgeRoadmap.yourScore', 'Seu Score')}
              </DialogTitle>
              <DialogDescription>
                {t('knowledgeRoadmap.shareDescription', 'Compartilhe seu progresso no LinkedIn!')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-lg font-medium">{shareText}</p>
              </div>
              
              <Button 
                onClick={copyToClipboard}
                className="w-full gap-2"
                variant={copied ? "secondary" : "default"}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied 
                  ? t('knowledgeRoadmap.copied', 'Copiado!') 
                  : t('knowledgeRoadmap.copyToClipboard', 'Copiar para Clipboard')
                }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ToolPageLayout>
  );
};

// Book Card Component
interface BookCardProps {
  book: CanonBook;
  isRead: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const BookCard = ({ book, isRead, onToggle, disabled }: BookCardProps) => {
  const { t } = useTranslation();
  const { coverUrl, loading: coverLoading, generate } = useBookCover(book);
  const categoryColor = getCategoryColor(book.category);
  const stageColor = getStageColor(book.critical_for_stage);
  const [imageLoaded, setImageLoaded] = useState(false);
  const hasTriggeredGeneration = useRef(false);

  // Auto-generate cover if none exists
  useEffect(() => {
    if (!coverUrl && !coverLoading && !hasTriggeredGeneration.current) {
      hasTriggeredGeneration.current = true;
      // Small random delay to stagger requests (0-2s)
      const delay = Math.random() * 2000;
      const timer = setTimeout(() => {
        generate();
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [coverUrl, coverLoading, generate]);

  const handleClick = () => {
    if (disabled) return;
    onToggle();
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group relative bg-card border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
        isRead ? "border-primary/50 shadow-lg shadow-primary/10" : "border-border hover:border-primary/30",
        "hover:-translate-y-1",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Book Cover */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {/* Gradient fallback - always rendered */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br flex flex-col justify-between p-3",
          categoryColor
        )}>
          <Badge variant="outline" className={cn("self-start text-[10px]", stageColor)}>
            {t(`knowledgeRoadmap.stages.${book.critical_for_stage}`, book.critical_for_stage)}
          </Badge>
          
          <div className="text-white">
            <h3 className="font-extrabold text-[15px] leading-tight line-clamp-3 mb-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {book.title}
            </h3>
            <p className="text-white/70 text-xs truncate">
              {book.author}
            </p>
          </div>

          {/* Loading indicator - shows during auto-generation */}
          {coverLoading && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-black/60 rounded-full p-2">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* AI generated cover - overlays gradient when loaded */}
        {coverUrl && (
          <img 
            src={coverUrl}
            alt={book.title}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        )}

        {/* Overlay with info on AI cover */}
        {coverUrl && imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3">
            <Badge variant="outline" className={cn("self-start text-[10px] mb-auto bg-black/30 backdrop-blur-sm", stageColor)}>
              {t(`knowledgeRoadmap.stages.${book.critical_for_stage}`, book.critical_for_stage)}
            </Badge>
            <div className="text-white">
              <h3 className="font-extrabold text-[15px] leading-tight line-clamp-2 mb-1 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {book.title}
              </h3>
              <p className="text-white/70 text-xs truncate">
                {book.author}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Read Toggle */}
      <div className="p-3 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <Checkbox 
          id={`book-${book.id}`}
          checked={isRead}
          onCheckedChange={handleClick}
          disabled={disabled}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <label 
          htmlFor={`book-${book.id}`}
          className={cn(
            "text-sm font-medium cursor-pointer select-none",
            isRead ? "text-primary" : "text-muted-foreground"
          )}
        >
          {isRead 
            ? t('knowledgeRoadmap.read', 'JÁ LI') 
            : t('knowledgeRoadmap.markAsRead', 'LI')
          }
        </label>
      </div>

      {/* Read Overlay */}
      {isRead && (
        <div className="absolute top-2 right-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Check className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeRoadmap;
