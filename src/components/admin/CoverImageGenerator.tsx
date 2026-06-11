import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Search, Check, RefreshCw, Loader2, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PexelsPhoto {
  id: number;
  large2x: string;
  medium: string;
  alt: string;
  photographer: string;
}

interface CoverImageGeneratorProps {
  title: string;
  tags: string;
  currentImage: string;
  onSelect: (url: string) => void;
}

// Static PT → EN translation map for common startup/business terms
const PT_EN_MAP: Record<string, string> = {
  cofundador: 'cofounder',
  cofundadora: 'cofounder',
  encontrar: 'find',
  como: 'how',
  técnico: 'technical',
  tecnico: 'technical',
  negócio: 'business',
  negocio: 'business',
  negócios: 'business',
  negocios: 'business',
  investidor: 'investor',
  investidores: 'investors',
  investimento: 'investment',
  empreendedor: 'entrepreneur',
  empreendedora: 'entrepreneur',
  empreendedorismo: 'entrepreneurship',
  startup: 'startup',
  startups: 'startups',
  produto: 'product',
  produtos: 'products',
  mercado: 'market',
  vendas: 'sales',
  vender: 'sell',
  crescimento: 'growth',
  equipe: 'team',
  time: 'team',
  fundador: 'founder',
  fundadora: 'founder',
  tecnologia: 'technology',
  inovação: 'innovation',
  inovacao: 'innovation',
  cliente: 'customer',
  clientes: 'customers',
  marketing: 'marketing',
  estratégia: 'strategy',
  estrategia: 'strategy',
  dinheiro: 'money',
  financeiro: 'finance',
  financiamento: 'funding',
  aceleração: 'acceleration',
  aceleracao: 'acceleration',
  aceleradora: 'accelerator',
  validação: 'validation',
  validacao: 'validation',
  liderança: 'leadership',
  lideranca: 'leadership',
  gestão: 'management',
  gestao: 'management',
  parceiro: 'partner',
  parceira: 'partner',
  parceria: 'partnership',
  contrato: 'contract',
  sociedade: 'partnership',
  sócio: 'partner',
  socio: 'partner',
  receita: 'revenue',
  lucro: 'profit',
  escalar: 'scale',
  escala: 'scale',
  pitch: 'pitch',
  mentoria: 'mentorship',
  mentor: 'mentor',
  rede: 'network',
  networking: 'networking',
  comunidade: 'community',
  plataforma: 'platform',
  digital: 'digital',
  dados: 'data',
  inteligência: 'intelligence',
  inteligencia: 'intelligence',
  artificial: 'artificial',
  software: 'software',
  aplicativo: 'app',
  desenvolvimento: 'development',
  programação: 'programming',
  programacao: 'programming',
  código: 'code',
  codigo: 'code',
  projeto: 'project',
  projetos: 'projects',
  sucesso: 'success',
  fracasso: 'failure',
  erro: 'mistake',
  erros: 'mistakes',
  dica: 'tip',
  dicas: 'tips',
  guia: 'guide',
  passo: 'step',
  passos: 'steps',
  problema: 'problem',
  solução: 'solution',
  solucao: 'solution',
  futuro: 'future',
  tendência: 'trend',
  tendencia: 'trend',
  tendências: 'trends',
  tendencias: 'trends',
  trabalho: 'work',
  remoto: 'remote',
  carreira: 'career',
};

function translateTerm(term: string): string {
  const normalized = term
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return PT_EN_MAP[normalized] || PT_EN_MAP[term.toLowerCase()] || term;
}

function generateQuery(title: string, tags: string): string {
  const stopWords = new Set(['como', 'para', 'com', 'que', 'uma', 'dos', 'das', 'nos', 'nas', 'por', 'seu', 'sua', 'seus', 'suas', 'mais', 'entre', 'sobre', 'pode', 'deve', 'qual', 'quais', 'isso', 'esta', 'este', 'esse', 'essa']);

  const titleWords = title
    .split(/\s+/)
    .map(w => w.replace(/[^a-záàâãéèêíóôõúüç]/gi, ''))
    .filter(w => w.length > 3 && !stopWords.has(w.toLowerCase()));

  const tagWords = tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const allTerms = [...titleWords, ...tagWords];

  // Deduplicate after translation
  const seen = new Set<string>();
  const translated: string[] = [];
  for (const term of allTerms) {
    const en = translateTerm(term);
    const key = en.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      translated.push(en);
    }
    if (translated.length >= 5) break;
  }

  return translated.join(' ');
}

export default function CoverImageGenerator({ title, tags, currentImage, onSelect }: CoverImageGeneratorProps) {
  const autoQuery = useMemo(() => generateQuery(title, tags), [title, tags]);
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // Use auto-generated query if user hasn't typed anything
  const effectiveQuery = query || autoQuery;

  const handleSearch = async () => {
    const q = effectiveQuery.trim();
    if (!q) {
      toast.error('Digite ou gere termos de busca');
      return;
    }

    setLoading(true);
    setSearched(true);
    setSelectedId(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Sessão expirada. Faça login novamente.');
        return;
      }

      const res = await supabase.functions.invoke('search-pexels', {
        body: { query: q },
      });

      if (res.error) {
        throw new Error(res.error.message || 'Erro ao buscar imagens');
      }

      setPhotos(res.data?.photos || []);

      if ((res.data?.photos || []).length === 0) {
        toast.info('Nenhuma imagem encontrada. Tente ajustar os termos.');
      }
    } catch (err: any) {
      console.error('Pexels search error:', err);
      toast.error(err.message || 'Erro ao buscar imagens');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (photo: PexelsPhoto) => {
    setSelectedId(photo.id);
    onSelect(photo.large2x);
  };

  return (
    <div className="space-y-4">
      {/* Query field + search button */}
      <div className="space-y-2">
        <Label>Termos de busca (gerados automaticamente)</Label>
        <div className="flex gap-2">
          <Input
            value={query || autoQuery}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: cofounder startup technology"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
          />
          <Button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="gap-2 flex-shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Buscar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Edite os termos acima para refinar os resultados. Termos em inglês geram melhores resultados.
        </p>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <AspectRatio key={i} ratio={16 / 9}>
              <Skeleton className="w-full h-full rounded-lg" />
            </AspectRatio>
          ))}
        </div>
      )}

      {/* Results grid */}
      {!loading && photos.length > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => handleSelect(photo)}
                className={cn(
                  'relative rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-primary',
                  selectedId === photo.id
                    ? 'border-[#7610DC] ring-2 ring-[#7610DC]/30'
                    : 'border-transparent hover:border-primary/40'
                )}
              >
                <AspectRatio ratio={16 / 9}>
                  <img
                    src={photo.medium}
                    alt={photo.alt || 'Pexels image'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </AspectRatio>
                {selectedId === photo.id && (
                  <div className="absolute inset-0 bg-[#7610DC]/20 flex items-center justify-center">
                    <div className="bg-[#7610DC] rounded-full p-2">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <p className="text-[10px] text-white/80 truncate">
                    Foto por {photo.photographer} via Pexels
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Search again */}
          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSearch}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Buscar novamente
            </Button>
          </div>
        </>
      )}

      {/* Empty state */}
      {!loading && searched && photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-2">
          <ImageOff className="h-10 w-10 opacity-50" />
          <p className="text-sm font-medium">Nenhuma imagem encontrada</p>
          <p className="text-xs text-center max-w-sm">
            Tente ajustar os termos de busca acima. Termos mais genéricos em inglês costumam trazer melhores resultados.
          </p>
        </div>
      )}

      {/* Current image preview */}
      {currentImage && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Imagem atual</Label>
          <div className="rounded-lg overflow-hidden border max-w-xs">
            <AspectRatio ratio={16 / 9}>
              <img
                src={currentImage}
                alt="Capa atual"
                className="w-full h-full object-cover"
              />
            </AspectRatio>
          </div>
        </div>
      )}
    </div>
  );
}
