import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Map, Search, Code, TrendingUp, Clock, Megaphone, MousePointerClick } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const BUTTON_LABELS: Record<string, string> = {
  cta_cadastro: "Encontre seu Co-fundador",
  cta_aceleracao: "Aceleração Guilda",
  blog: "Blog",
  linkedin: "LinkedIn",
  whatsapp: "WhatsApp",
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [blogPosts, seoConfigs, sitemapEntries, trackingScripts, banners] = await Promise.all([
        supabase.from('mkt_blog_posts').select('id, is_published', { count: 'exact' }),
        supabase.from('mkt_seo_configs').select('id', { count: 'exact' }),
        supabase.from('mkt_sitemap_entries').select('id, is_active', { count: 'exact' }),
        supabase.from('mkt_tracking_scripts').select('id, is_active', { count: 'exact' }),
        supabase.from('mkt_banners').select('id, is_active', { count: 'exact' }),
      ]);

      const publishedPosts = blogPosts.data?.filter(p => p.is_published).length || 0;
      const activeSitemap = sitemapEntries.data?.filter(s => s.is_active).length || 0;
      const activeScripts = trackingScripts.data?.filter(s => s.is_active).length || 0;
      const activeBanners = banners.data?.filter(b => b.is_active).length || 0;

      return {
        blogPosts: { total: blogPosts.count || 0, published: publishedPosts },
        seoConfigs: seoConfigs.count || 0,
        sitemapEntries: { total: sitemapEntries.count || 0, active: activeSitemap },
        trackingScripts: { total: trackingScripts.count || 0, active: activeScripts },
        banners: { total: banners.count || 0, active: activeBanners },
      };
    },
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: linkClicks, isLoading: isLoadingClicks } = useQuery({
    queryKey: ['link-clicks-30d'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('link_clicks')
        .select('button_id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (error) throw error;

      const counts: Record<string, number> = {};
      data?.forEach((row) => {
        counts[row.button_id] = (counts[row.button_id] || 0) + 1;
      });

      return Object.entries(counts)
        .map(([button_id, clicks]) => ({ button_id, clicks }))
        .sort((a, b) => b.clicks - a.clicks);
    },
  });

  const statCards = [
    { title: 'Blog Posts', value: stats?.blogPosts.total || 0, subtitle: `${stats?.blogPosts.published || 0} publicados`, icon: FileText, to: '/mkt-admin/blog', color: 'text-primary' },
    { title: 'Configurações SEO', value: stats?.seoConfigs || 0, subtitle: 'páginas configuradas', icon: Search, to: '/mkt-admin/seo', color: 'text-accent-foreground' },
    { title: 'Sitemap', value: stats?.sitemapEntries.active || 0, subtitle: `${stats?.sitemapEntries.total || 0} total`, icon: Map, to: '/mkt-admin/sitemap', color: 'text-primary' },
    { title: 'Tracking Scripts', value: stats?.trackingScripts.active || 0, subtitle: `${stats?.trackingScripts.total || 0} total`, icon: Code, to: '/mkt-admin/tracking', color: 'text-primary' },
    { title: 'Banners', value: stats?.banners.active || 0, subtitle: `${stats?.banners.total || 0} total`, icon: Megaphone, to: '/mkt-admin/banners', color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do Guilda Marketing Admin
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link key={stat.to} to={stat.to}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isLoading ? '...' : stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>Tarefas comuns de administração</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/mkt-admin/blog/new" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <p className="font-medium">Criar novo artigo</p>
              <p className="text-sm text-muted-foreground">Escreva e publique um novo post no blog</p>
            </Link>
            <Link to="/mkt-admin/seo" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <p className="font-medium">Otimizar SEO</p>
              <p className="text-sm text-muted-foreground">Configure títulos e descrições das páginas</p>
            </Link>
            <Link to="/mkt-admin/tracking" className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              <p className="font-medium">Adicionar Pixel</p>
              <p className="text-sm text-muted-foreground">Configure Google Analytics ou Meta Pixel</p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Informações do Sistema
            </CardTitle>
            <CardDescription>Status e configurações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span className="text-sm">Ambiente</span>
              <span className="text-sm font-medium text-green-500">Produção</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span className="text-sm">Cache de Blog</span>
              <span className="text-sm font-medium">5 min</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted">
              <span className="text-sm">Última atualização</span>
              <span className="text-sm font-medium">{new Date().toLocaleDateString('pt-BR')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link Clicks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MousePointerClick className="h-5 w-5 text-primary" />
            Cliques — Página de Links
          </CardTitle>
          <CardDescription>Últimos 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingClicks ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : !linkClicks?.length ? (
            <p className="text-sm text-muted-foreground">Nenhum clique registrado ainda.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Botão</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {linkClicks.map((row) => (
                  <TableRow key={row.button_id}>
                    <TableCell className="font-medium">
                      {BUTTON_LABELS[row.button_id] || row.button_id}
                    </TableCell>
                    <TableCell className="text-right">{row.clicks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
