import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Send, Loader2, Eye, ChevronDown, ChevronRight, Plus, X, Search as SearchIcon } from 'lucide-react';
import { toast } from 'sonner';
import CoverImageGenerator from '@/components/admin/CoverImageGenerator';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface FaqItem {
  pergunta: string;
  resposta: string;
}

interface BlogPostForm {
  slug: string;
  title_pt: string;
  title_en: string;
  title_es: string;
  excerpt_pt: string;
  excerpt_en: string;
  excerpt_es: string;
  content_pt: string;
  content_en: string;
  content_es: string;
  author: string;
  cover_image: string;
  tags: string;
  reading_time: number;
  is_hot: boolean;
  is_published: boolean;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  categoria: string;
  og_title: string;
  og_description: string;
  og_image: string;
  noindex: boolean;
  keyword_foco: string;
  schema_faq: FaqItem[];
}

const defaultForm: BlogPostForm = {
  slug: '',
  title_pt: '',
  title_en: '',
  title_es: '',
  excerpt_pt: '',
  excerpt_en: '',
  excerpt_es: '',
  content_pt: '',
  content_en: '',
  content_es: '',
  author: 'Guilda',
  cover_image: '',
  tags: '',
  reading_time: 5,
  is_hot: false,
  is_published: false,
  meta_title: '',
  meta_description: '',
  canonical_url: '',
  categoria: '',
  og_title: '',
  og_description: '',
  og_image: '',
  noindex: false,
  keyword_foco: '',
  schema_faq: [],
};

const CATEGORIAS = ['Cofundador', 'Startup', 'MVP', 'Growth', 'Aceleração', 'Produto', 'Mercado'];

function CharCounter({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const color = max === 60
    ? len <= 50 ? 'text-green-600' : len <= 60 ? 'text-yellow-600' : 'text-red-600'
    : len <= 140 ? 'text-green-600' : len <= 160 ? 'text-yellow-600' : 'text-red-600';
  return <span className={`text-xs font-mono ${color}`}>{len}/{max}</span>;
}

function WordCounter({ text, isPt, onReadingTimeChange }: { text: string; isPt: boolean; onReadingTimeChange?: (minutes: number) => void }) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  useEffect(() => {
    if (isPt && onReadingTimeChange) {
      onReadingTimeChange(minutes);
    }
  }, [minutes, isPt, onReadingTimeChange]);

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
      <span>{words} palavras</span>
      <span>~{minutes} min de leitura</span>
      {isPt && (
        <span className="italic">
          Calculado com base no conteúdo em Português
        </span>
      )}
    </div>
  );
}

function handleAutoResize(e: React.FormEvent<HTMLTextAreaElement>) {
  const target = e.currentTarget;
  target.style.height = 'auto';
  target.style.height = target.scrollHeight + 'px';
}

function GooglePreview({ form }: { form: BlogPostForm }) {
  const previewTitle = (form.meta_title || form.title_pt || 'Título do artigo').slice(0, 60);
  const previewUrl = `guilda.app.br/blog/${form.slug || 'meu-artigo'}`;
  const previewDesc = (form.meta_description || form.excerpt_pt || 'Descrição do artigo...').slice(0, 160);

  return (
    <div className="border rounded-lg p-4 bg-white space-y-1">
      <div className="flex items-center gap-1 mb-1">
        <SearchIcon className="h-3 w-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-medium">Preview do Google</span>
      </div>
      <p className="text-lg text-blue-700 hover:underline cursor-default leading-snug font-medium truncate">
        {previewTitle}{previewTitle.length < (form.meta_title || form.title_pt || '').length ? '...' : ''} — Guilda
      </p>
      <p className="text-xs text-green-700">{previewUrl}</p>
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{previewDesc}</p>
    </div>
  );
}

function ContentEditor({ 
  content, 
  onChange, 
  placeholder, 
  isPt, 
  onReadingTimeChange 
}: { 
  content: string; 
  onChange: (value: string) => void; 
  placeholder: string; 
  isPt: boolean; 
  onReadingTimeChange?: (minutes: number) => void;
}) {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Conteúdo (Markdown){isPt ? ' *' : ''}</Label>
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'edit' | 'preview')}>
          <TabsList className="h-8">
            <TabsTrigger value="edit" className="text-xs px-2 py-1 h-6">Editar</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs px-2 py-1 h-6">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'edit' ? (
        <Textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          onInput={handleAutoResize}
          placeholder={placeholder}
          className="font-mono text-sm min-h-[500px] overflow-y-auto resize-y"
        />
      ) : (
        <div className="min-h-[500px] h-auto border rounded-md p-4 prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || '*Nenhum conteúdo para visualizar*'}
          </ReactMarkdown>
        </div>
      )}

      <WordCounter text={content} isPt={isPt} onReadingTimeChange={onReadingTimeChange} />
    </div>
  );
}

export default function BlogEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<BlogPostForm>(defaultForm);
  const [seoOpen, setSeoOpen] = useState(true);
  const [ogOpen, setOgOpen] = useState(true);
  const [faqOpen] = useState(true); // kept for type compatibility
  const [customCategoria, setCustomCategoria] = useState(false);
  const [manualReadingTime, setManualReadingTime] = useState(false);
  const isEditing = !!id;

  const handleReadingTimeChange = useCallback((minutes: number) => {
    if (!manualReadingTime) {
      setForm(prev => ({ ...prev, reading_time: minutes }));
    }
  }, [manualReadingTime]);

  // Fetch existing post
  const { data: post, isLoading } = useQuery({
    queryKey: ['admin-blog-post', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('mkt_blog_posts')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (post) {
      const cat = (post as any).categoria || '';
      const isCustom = cat && !CATEGORIAS.includes(cat);
      setCustomCategoria(isCustom);
      
      setForm({
        slug: post.slug,
        title_pt: post.title_pt,
        title_en: post.title_en || '',
        title_es: post.title_es || '',
        excerpt_pt: post.excerpt_pt || '',
        excerpt_en: post.excerpt_en || '',
        excerpt_es: post.excerpt_es || '',
        content_pt: post.content_pt,
        content_en: post.content_en || '',
        content_es: post.content_es || '',
        author: post.author,
        cover_image: post.cover_image || '',
        tags: post.tags?.join(', ') || '',
        reading_time: post.reading_time || 5,
        is_hot: post.is_hot || false,
        is_published: post.is_published || false,
        meta_title: (post as any).meta_title || '',
        meta_description: (post as any).meta_description || '',
        canonical_url: (post as any).canonical_url || '',
        categoria: cat,
        og_title: (post as any).og_title || '',
        og_description: (post as any).og_description || '',
        og_image: (post as any).og_image || '',
        noindex: (post as any).noindex || false,
        keyword_foco: (post as any).keyword_foco || '',
        schema_faq: (post as any).schema_faq || [],
      });
    }
  }, [post]);

  const saveMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const payload = {
        slug: data.slug,
        title_pt: data.title_pt,
        title_en: data.title_en || null,
        title_es: data.title_es || null,
        excerpt_pt: data.excerpt_pt || null,
        excerpt_en: data.excerpt_en || null,
        excerpt_es: data.excerpt_es || null,
        content_pt: data.content_pt,
        content_en: data.content_en || null,
        content_es: data.content_es || null,
        author: data.author,
        cover_image: data.cover_image || null,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        reading_time: data.reading_time,
        is_hot: data.is_hot,
        is_published: true,
        published_at: new Date().toISOString(),
        created_by: user?.id,
      };

      // SEO fields sent via raw fetch to avoid type issues with new columns
      const seoFields = {
        meta_title: data.meta_title || null,
        meta_description: data.meta_description || null,
        canonical_url: data.canonical_url || null,
        categoria: data.categoria || null,
        og_title: data.og_title || null,
        og_description: data.og_description || null,
        og_image: data.og_image || null,
        noindex: data.noindex,
        keyword_foco: data.keyword_foco || null,
        schema_faq: data.schema_faq.length > 0 ? data.schema_faq : null,
      };

      const fullPayload = { ...payload, ...seoFields };

      if (isEditing) {
        const { error } = await supabase
          .from('mkt_blog_posts')
          .update(fullPayload as any)
          .eq('id', id);
        if (error) throw error;
      } else {
        // Try inserting; if slug is duplicate, append a numeric suffix
        let { error } = await supabase
          .from('mkt_blog_posts')
          .insert(fullPayload as any);
        if (error && error.message?.includes('mkt_blog_posts_slug_key')) {
          const uniqueSlug = `${fullPayload.slug}-${Date.now().toString(36)}`;
          const { error: retryError } = await supabase
            .from('mkt_blog_posts')
            .insert({ ...fullPayload, slug: uniqueSlug } as any);
          if (retryError) throw retryError;
        } else if (error) {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog-posts'] });
      toast.success(isEditing ? 'Post atualizado!' : 'Post criado!');
      navigate('/mkt-admin/blog');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.slug || !form.title_pt || !form.content_pt) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }
    saveMutation.mutate(form);
  };

  const generateSlug = () => {
    const slug = form.title_pt
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setForm({ ...form, slug });
  };

  const calculateReadingTime = () => {
    const words = form.content_pt.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    setForm({ ...form, reading_time: minutes });
    setManualReadingTime(false);
  };

  const addFaqItem = () => {
    setForm({ ...form, schema_faq: [...form.schema_faq, { pergunta: '', resposta: '' }] });
  };

  const removeFaqItem = (index: number) => {
    setForm({ ...form, schema_faq: form.schema_faq.filter((_, i) => i !== index) });
  };

  const updateFaqItem = (index: number, field: 'pergunta' | 'resposta', value: string) => {
    const updated = [...form.schema_faq];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, schema_faq: updated });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/mkt-admin/blog')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditing ? 'Editar Post' : 'Novo Post'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Modifique o conteúdo do artigo' : 'Crie um novo artigo para o blog'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="meu-artigo"
                  />
                  <Button type="button" variant="outline" onClick={generateSlug}>
                    Gerar
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="startup, mvp, produto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reading_time">Tempo de Leitura (min)</Label>
                <div className="flex gap-2">
                  <Input
                    id="reading_time"
                    type="number"
                    min={1}
                    value={form.reading_time}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (isNaN(val) || e.target.value === '') {
                        setForm({ ...form, reading_time: 0 });
                        setManualReadingTime(false);
                      } else {
                        setForm({ ...form, reading_time: val });
                        setManualReadingTime(true);
                      }
                    }}
                  />
                  <Button type="button" variant="outline" onClick={calculateReadingTime}>
                    Calcular
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_published"
                  checked={form.is_published}
                  onCheckedChange={(checked) => setForm({ ...form, is_published: checked })}
                />
                <Label htmlFor="is_published">Publicado</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_hot"
                  checked={form.is_hot}
                  onCheckedChange={(checked) => setForm({ ...form, is_hot: checked })}
                />
                <Label htmlFor="is_hot">Destaque</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🖼️</span> Imagem de Capa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cover_image">URL da imagem</Label>
              <Input
                id="cover_image"
                value={form.cover_image}
                onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                placeholder="https://... (ou busque abaixo via Pexels)"
              />
            </div>

            <CoverImageGenerator
              title={form.title_pt}
              tags={form.tags}
              currentImage={form.cover_image}
              onSelect={(url) => setForm({ ...form, cover_image: url })}
            />
          </CardContent>
        </Card>

        {/* SEO & Open Graph (Collapsible) */}
        <Card>
          <Collapsible open={seoOpen} onOpenChange={setSeoOpen}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardTitle className="flex items-center gap-2">
                  {seoOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  SEO & Open Graph
                </CardTitle>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-6">
                {/* Meta Title */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Meta Title</Label>
                    <CharCounter value={form.meta_title} max={60} />
                  </div>
                  <Input
                    value={form.meta_title}
                    onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    placeholder="Título para o Google (máx. 60 caracteres)"
                  />
                  <p className="text-xs text-muted-foreground">Aparece como título nos resultados do Google. Se vazio, usa o Título do artigo.</p>
                </div>

                {/* Meta Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Meta Description</Label>
                    <CharCounter value={form.meta_description} max={160} />
                  </div>
                  <Textarea
                    value={form.meta_description}
                    onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                    placeholder="Descrição para o Google (máx. 160 caracteres)"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">Aparece como snippet abaixo do título no Google. Se vazio, usa o Resumo.</p>
                </div>

                {/* Keyword Foco + Categoria */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Keyword Foco</Label>
                    <Input
                      value={form.keyword_foco}
                      onChange={(e) => setForm({ ...form, keyword_foco: e.target.value })}
                      placeholder="ex: encontrar cofundador startup"
                    />
                    <p className="text-xs text-muted-foreground">Palavra-chave principal do artigo para SEO.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    {customCategoria ? (
                      <div className="flex gap-2">
                        <Input
                          value={form.categoria}
                          onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                          placeholder="Categoria personalizada"
                        />
                        <Button type="button" variant="outline" size="sm" onClick={() => { setCustomCategoria(false); setForm({ ...form, categoria: '' }); }}>
                          Voltar
                        </Button>
                      </div>
                    ) : (
                      <Select
                        value={form.categoria}
                        onValueChange={(val) => {
                          if (val === '__other__') {
                            setCustomCategoria(true);
                            setForm({ ...form, categoria: '' });
                          } else {
                            setForm({ ...form, categoria: val });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIAS.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                          <SelectItem value="__other__">Outra...</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <p className="text-xs text-muted-foreground">Categoria principal do artigo (diferente de tags).</p>
                  </div>
                </div>

                {/* Noindex toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    id="noindex"
                    checked={form.noindex}
                    onCheckedChange={(checked) => setForm({ ...form, noindex: checked })}
                  />
                  <Label htmlFor="noindex">Não indexar (noindex)</Label>
                  <span className="text-xs text-muted-foreground ml-2">Se ativado, o Google não vai indexar este artigo.</span>
                </div>

                {/* Open Graph (Avançado) */}
                <Collapsible open={ogOpen} onOpenChange={setOgOpen}>
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="ghost" className="w-full justify-start gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                      {ogOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                      Open Graph (Avançado)
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pl-4 pt-2">
                    <div className="space-y-2">
                      <Label>OG Title</Label>
                      <Input
                        value={form.og_title}
                        onChange={(e) => setForm({ ...form, og_title: e.target.value })}
                        placeholder="Título para redes sociais (se diferente do Meta Title)"
                      />
                      <p className="text-xs text-muted-foreground">Se vazio, usa o Meta Title.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>OG Description</Label>
                      <Textarea
                        value={form.og_description}
                        onChange={(e) => setForm({ ...form, og_description: e.target.value })}
                        placeholder="Descrição para redes sociais (se diferente)"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">Se vazio, usa a Meta Description.</p>
                    </div>
                    <div className="space-y-2">
                      <Label>OG Image</Label>
                      <Input
                        value={form.og_image}
                        onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                        placeholder="URL da imagem para redes sociais (1200×630px ideal)"
                      />
                      <p className="text-xs text-muted-foreground">Se vazio, usa a Imagem de Capa.</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>




                {/* Google Preview */}
                <GooglePreview form={form} />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Content by Language */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pt">
              <TabsList>
                <TabsTrigger value="pt">Português *</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
                <TabsTrigger value="es">Español</TabsTrigger>
              </TabsList>

              <TabsContent value="pt" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Título *</Label>
                  <Input
                    value={form.title_pt}
                    onChange={(e) => setForm({ ...form, title_pt: e.target.value })}
                    placeholder="Título do artigo em português"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resumo</Label>
                  <Textarea
                    value={form.excerpt_pt}
                    onChange={(e) => setForm({ ...form, excerpt_pt: e.target.value })}
                    placeholder="Breve descrição do artigo..."
                    rows={2}
                  />
                </div>
                <ContentEditor
                  content={form.content_pt}
                  onChange={(val) => setForm({ ...form, content_pt: val })}
                  placeholder="# Título&#10;&#10;Seu conteúdo em Markdown..."
                  isPt={true}
                  onReadingTimeChange={handleReadingTimeChange}
                />
              </TabsContent>

              <TabsContent value="en" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    placeholder="Article title in English"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea
                    value={form.excerpt_en}
                    onChange={(e) => setForm({ ...form, excerpt_en: e.target.value })}
                    placeholder="Brief description..."
                    rows={2}
                  />
                </div>
                <ContentEditor
                  content={form.content_en}
                  onChange={(val) => setForm({ ...form, content_en: val })}
                  placeholder="# Title&#10;&#10;Your content in Markdown..."
                  isPt={false}
                />
              </TabsContent>

              <TabsContent value="es" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={form.title_es}
                    onChange={(e) => setForm({ ...form, title_es: e.target.value })}
                    placeholder="Título del artículo en español"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Resumen</Label>
                  <Textarea
                    value={form.excerpt_es}
                    onChange={(e) => setForm({ ...form, excerpt_es: e.target.value })}
                    placeholder="Breve descripción..."
                    rows={2}
                  />
                </div>
                <ContentEditor
                  content={form.content_es}
                  onChange={(val) => setForm({ ...form, content_es: val })}
                  placeholder="# Título&#10;&#10;Tu contenido en Markdown..."
                  isPt={false}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/mkt-admin/blog')}
          >
            Cancelar
          </Button>
          {form.slug && (
            <Button
              type="button"
              variant="outline"
              onClick={() => window.open(`/blog/${form.slug}`, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Postar
          </Button>
        </div>
      </form>
    </div>
  );
}
