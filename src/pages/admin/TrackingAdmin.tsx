import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Code, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingScript {
  id: string;
  name: string;
  type: string;
  script_head: string | null;
  script_body: string | null;
  is_active: boolean;
  load_priority: number;
  pages: string[];
  exclude_pages: string[];
  created_at: string;
}

const typeOptions = [
  { value: 'analytics', label: 'Analytics', color: 'bg-primary' },
  { value: 'pixel', label: 'Pixel', color: 'bg-secondary' },
  { value: 'custom', label: 'Custom', color: 'bg-muted' },
];

const defaultForm = {
  name: '',
  type: 'analytics',
  script_head: '',
  script_body: '',
  is_active: true,
  load_priority: 10,
  pages: '',
  exclude_pages: '',
};

export default function TrackingAdmin() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const { data: scripts, isLoading } = useQuery({
    queryKey: ['admin-tracking-scripts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mkt_tracking_scripts')
        .select('*')
        .order('load_priority', { ascending: true });
      if (error) throw error;
      return data as TrackingScript[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        type: form.type,
        script_head: form.script_head || null,
        script_body: form.script_body || null,
        is_active: form.is_active,
        load_priority: form.load_priority,
        pages: form.pages ? form.pages.split(',').map(p => p.trim()).filter(Boolean) : [],
        exclude_pages: form.exclude_pages ? form.exclude_pages.split(',').map(p => p.trim()).filter(Boolean) : [],
      };

      if (editingId) {
        const { error } = await supabase
          .from('mkt_tracking_scripts')
          .update(payload)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('mkt_tracking_scripts')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tracking-scripts'] });
      toast.success(editingId ? 'Script atualizado!' : 'Script criado!');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('mkt_tracking_scripts')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tracking-scripts'] });
    },
  });

  const deleteScript = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mkt_tracking_scripts')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tracking-scripts'] });
      toast.success('Script removido');
      setDeleteId(null);
    },
  });

  const handleEdit = (script: TrackingScript) => {
    setEditingId(script.id);
    setForm({
      name: script.name,
      type: script.type,
      script_head: script.script_head || '',
      script_body: script.script_body || '',
      is_active: script.is_active,
      load_priority: script.load_priority,
      pages: script.pages?.join(', ') || '',
      exclude_pages: script.exclude_pages?.join(', ') || '',
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tracking Scripts</h1>
          <p className="text-muted-foreground">
            Gerencie Google Analytics, Meta Pixel e scripts customizados
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Script
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Páginas</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : scripts?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum script cadastrado
                </TableCell>
              </TableRow>
            ) : (
              scripts?.map((script) => (
                <TableRow key={script.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{script.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={typeOptions.find(t => t.value === script.type)?.color}
                    >
                      {typeOptions.find(t => t.value === script.type)?.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{script.load_priority}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {script.pages?.length ? script.pages.length + ' páginas' : 'Todas'}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={script.is_active}
                      onCheckedChange={(checked) =>
                        toggleActive.mutate({ id: script.id, is_active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(script)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(script.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Editar Script' : 'Novo Script'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Google Analytics"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) => setForm({ ...form, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Script para &lt;head&gt;</Label>
              <Textarea
                value={form.script_head}
                onChange={(e) => setForm({ ...form, script_head: e.target.value })}
                placeholder="<script>...</script>"
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label>Script para &lt;body&gt;</Label>
              <Textarea
                value={form.script_body}
                onChange={(e) => setForm({ ...form, script_body: e.target.value })}
                placeholder="<script>...</script>"
                rows={4}
                className="font-mono text-sm"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Prioridade de Carregamento</Label>
                <Input
                  type="number"
                  value={form.load_priority}
                  onChange={(e) => setForm({ ...form, load_priority: parseInt(e.target.value) || 10 })}
                />
                <p className="text-xs text-muted-foreground">Menor = carrega primeiro</p>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Páginas (vazio = todas)</Label>
              <Input
                value={form.pages}
                onChange={(e) => setForm({ ...form, pages: e.target.value })}
                placeholder="/blog, /ferramentas-empreendedores"
              />
              <p className="text-xs text-muted-foreground">
                Lista de paths separados por vírgula. Deixe vazio para todas as páginas.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Excluir Páginas</Label>
              <Input
                value={form.exclude_pages}
                onChange={(e) => setForm({ ...form, exclude_pages: e.target.value })}
                placeholder="/admin, /mkt-admin"
              />
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!form.name || saveMutation.isPending}
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

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover script?</AlertDialogTitle>
            <AlertDialogDescription>
              Este script será removido e não será mais carregado nas páginas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteScript.mutate(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
