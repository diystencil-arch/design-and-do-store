import { ReactNode } from 'react';
import { NavLink, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingBag, FileText, Mail, Users, BarChart3, Megaphone, Wallet, HelpCircle, FolderTree, Settings, Tag } from 'lucide-react';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
  { to: '/admin/stats', label: 'Stats', icon: BarChart3 },
  { to: '/admin/marketing', label: 'Marketing', icon: Megaphone },
  { to: '/admin/promos', label: 'Promos', icon: Tag },
  { to: '/admin/finances', label: 'Finances', icon: Wallet },
  { to: '/admin/blog', label: 'Blog', icon: FileText },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/help', label: 'Help', icon: HelpCircle },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <div className="container-page py-20 text-center text-muted-foreground">Loading…</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return (
    <div className="container-page py-20 text-center">
      <h1 className="section-heading">Access denied</h1>
      <p className="text-muted-foreground mt-2">You need admin privileges to view this page.</p>
    </div>
  );

  return (
    <div className="container-page py-8 grid md:grid-cols-[220px_1fr] gap-8">
      <aside className="space-y-1">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">Admin</h2>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
              }`
            }
          >
            <l.icon size={16} /> {l.label}
          </NavLink>
        ))}
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
