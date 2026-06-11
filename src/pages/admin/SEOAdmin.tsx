import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Search, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SEOConfig {
  id: string;
  page_path: string;
  title_pt: string | null;
  title_en: string | null;
  title_es: string | null;
  description_pt: string | null;
  description_en: string | null;
  description_es: string | null;
  keywords: string[];
  og_image: string | null;
  canonical_url: string | null;
  no_index: boolean;
  schema_json: Record<string, unknown> | null;
  updated_at: string;
}

const defaultForm = {
  page_path: '',
  title_pt: '',
  title_en: '',
  title_es: '',
  description_pt: '',
  description_en: '',
  description_es: '',
  keywords: '',
  og_image: '',
  canonical_url: '',
  no_index: false,
  schema_json: '',
};

export default function SEOAdmin() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: configs, isLoading } = useQuery({
    queryKey: ['admin-seo-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mkt_seo_configs')
        .select('*')
        .order('page_path');
      if (error) throw error;
      return data as SEOConfig[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      let schemaJson = null;
      if (form.schema_json.trim()) {
        try {
          schemaJson = JSON.parse(form.schema_json);
        } catch {
          throw new Error('JSON Schema inválido');
        }
      }

      const payload = {
        page_path: form.page_path,
        title_pt: form.title_pt || null,
        title_en: form.title_en || null,
        title_es: form.title_es || null,
        description_pt: form.description_pt || null,
        description_en: form.description_en || null,
        description_es: form.description_es || null,
        keywords: form.keywords ? form.keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
        og_image: form.og_image || null,
        canonical_url: form.canonical_url || null,
        no_index: form.no_index,
        schema_json: schemaJson,
        updated_by: user?.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('mkt_seo_configs')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mkt_seo_configs')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seo-configs'] });
      toast.success(editingId ? 'Configuração atualizada!' : 'Configuração criada!');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (config: SEOConfig) => {
    setEditingId(config.id);
    setForm({
      page_path: config.page_path,
      title_pt: config.title_pt || '',
      title_en: config.title_en || '',
      title_es: config.title_es || '',
      description_pt: config.description_pt || '',
      description_en: config.description_en || '',
      description_es: config.description_es || '',
      keywords: config.keywords?.join(', ') || '',
      og_image: config.og_image || '',
      canonical_url: config.canonical_url || '',
      no_index: config.no_index || false,
      schema_json: config.schema_json ? JSON.stringify(config.schema_json, null, 2) : '',
    });
    setIsOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setForm(defaultForm);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditingId(null);
    setForm(defaultForm);
  };

  const filteredConfigs = configs?.filter(c =>
    c.page_path.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações SEO</h1>
          <p className="text-muted-foreground">
            Configure título, descrição e metadados por página
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Página
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por path..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Página</TableHead>
              <TableHead>Título (PT)</TableHead>
              <TableHead>Keywords</TableHead>
              <TableHead>noIndex</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : filteredConfigs?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma configuração encontrada
                </TableCell>
              </TableRow>
            ) : (
              filteredConfigs?.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-mono text-sm">
                    {config.page_path}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {config.title_pt || <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {config.keywords?.length || 0} keywords
                  </TableCell>
                  <TableCell>
                    {config.no_index ? (
                      <span className="text-destructive text-sm">Sim</span>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(config.updated_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Configuração SEO' : 'Nova Configuração SEO'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Path da Página *</Label>
                <Input
                  value={form.page_path}
                  onChange={(e) => setForm({ ...form, page_path: e.target.value })}
                  placeholder="/ferramentas-empreendedores"
                  disabled={!!editingId}
                />
              </div>
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  value={form.canonical_url}
                  onChange={(e) => setForm({ ...form, canonical_url: e.target.value })}
                  placeholder="https://guilda.app.br/..."
                />
              </div>
            </div>

            {/* Title & Description by Language */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Título e Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pt">
                  <TabsList>
                    <TabsTrigger value="pt">Português</TabsTrigger>
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="es">Español</TabsTrigger>
                  </TabsList>

                  <TabsContent value="pt" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Título (máx 60 caracteres)</Label>
                      <Input
                        value={form.title_pt}
                        onChange={(e) => setForm({ ...form, title_pt: e.target.value })}
                        maxLength={60}
                      />
                      <p className="text-xs text-muted-foreground">{form.title_pt.length}/60</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição (máx 160 caracteres)</Label>
                      <Textarea
                        value={form.description_pt}
                        onChange={(e) => setForm({ ...form, description_pt: e.target.value })}
                        maxLength={160}
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">{form.description_pt.length}/160</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="en" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Title (max 60 chars)</Label>
                      <Input
                        value={form.title_en}
                        onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                        maxLength={60}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description (max 160 chars)</Label>
                      <Textarea
                        value={form.description_en}
                        onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                        maxLength={160}
                        rows={2}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="es" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Título (máx 60 caracteres)</Label>
                      <Input
                        value={form.title_es}
                        onChange={(e) => setForm({ ...form, title_es: e.target.value })}
                        maxLength={60}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descripción (máx 160 caracteres)</Label>
                      <Textarea
                        value={form.description_es}
                        onChange={(e) => setForm({ ...form, description_es: e.target.value })}
                        maxLength={160}
                        rows={2}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Keywords & OG Image */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Keywords (separadas por vírgula)</Label>
                <Textarea
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  placeholder="startup, empreendedorismo, mvp"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>OG Image URL</Label>
                <Input
                  value={form.og_image}
                  onChange={(e) => setForm({ ...form, og_image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Schema JSON */}
            <div className="space-y-2">
              <Label>Schema.org JSON-LD (opcional)</Label>
              <Textarea
                value={form.schema_json}
                onChange={(e) => setForm({ ...form, schema_json: e.target.value })}
                placeholder='{"@context": "https://schema.org", ...}'
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            {/* noIndex */}
            <div className="flex items-center gap-2">
              <Switch
                id="no_index"
                checked={form.no_index}
                onCheckedChange={(checked) => setForm({ ...form, no_index: checked })}
              />
              <Label htmlFor="no_index">noIndex (não indexar no Google)</Label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!form.page_path || saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
