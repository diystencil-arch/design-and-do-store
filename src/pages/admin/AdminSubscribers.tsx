import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

interface Sub { id: string; email: string; source: string | null; freebie_sent: boolean; created_at: string; }

export default function AdminSubscribers() {
  const [subs, setSubs] = useState<Sub[]>([]);

  useEffect(() => {
    supabase.from('email_subscribers').select('*').order('created_at', { ascending: false }).limit(500)
      .then(({ data }) => setSubs((data || []) as Sub[]));
  }, []);

  const exportCsv = () => {
    const csv = ['email,source,freebie_sent,created_at', ...subs.map((s) => `${s.email},${s.source || ''},${s.freebie_sent},${s.created_at}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click();
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-heading">Email subscribers ({subs.length})</h1>
        <button onClick={exportCsv} className="btn-outline text-sm py-2 px-4">Export CSV</button>
      </div>
      <div className="product-card">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-muted-foreground border-b border-border"><th className="pb-2">Email</th><th className="pb-2">Source</th><th className="pb-2">Date</th></tr></thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="py-2">{s.email}</td>
                <td className="py-2 text-muted-foreground">{s.source || '—'}</td>
                <td className="py-2 text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {subs.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">No subscribers yet.</p>}
      </div>
    </AdminLayout>
  );
}
