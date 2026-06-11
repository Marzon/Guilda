import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from '@/hooks/useAuth';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Map,
  Search,
  Code,
  LogOut,
  Menu,
  X,
  Shield,
  Megaphone,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/mkt-admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/mkt-admin/blog', icon: FileText, label: 'Blog Posts' },
  { to: '/mkt-admin/banners', icon: Megaphone, label: 'Banners' },
  { to: '/mkt-admin/sitemap', icon: Map, label: 'Sitemap' },
  { to: '/mkt-admin/seo', icon: Search, label: 'SEO' },
  { to: '/mkt-admin/tracking', icon: Code, label: 'Tracking' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/mkt-admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-semibold">Admin Console</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2 px-6 py-4 border-b border-border">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-semibold">Admin Console</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 mt-14 lg:mt-0 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )
                }
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User & Logout */}
          <div className="px-3 py-4 border-t border-border space-y-2">
            <p className="px-3 text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-14 lg:pt-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
