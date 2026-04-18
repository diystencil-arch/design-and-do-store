import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';

interface Msg { id: string; name: string; email: string; subject: string; message: string; status: string; created_at: string; }

export default function AdminMessages() {
  const [msgs, setMsgs] = useState<Msg[]>([]);

  const load = () => {
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(100)
      .then(({ data }) => setMsgs((data || []) as Msg[]));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id);
    load();
  };

  return (
    <AdminLayout>
      <h1 className="section-heading mb-6">Contact messages</h1>
      {msgs.length === 0 ? (
        <p className="text-muted-foreground text-sm">No messages yet.</p>
      ) : (
        <div className="space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`product-card ${m.status === 'new' ? 'border-primary/40' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{m.subject}</p>
                  <p className="text-sm text-muted-foreground">{m.name} &lt;{m.email}&gt; · {new Date(m.created_at).toLocaleString()}</p>
                </div>
                {m.status === 'new' && <button onClick={() => markRead(m.id)} className="text-xs text-primary hover:underline">Mark read</button>}
              </div>
              <p className="text-sm text-foreground mt-3 whitespace-pre-wrap">{m.message}</p>
              <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}`} className="text-sm text-primary hover:underline mt-3 inline-block">Reply →</a>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
