import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

const FIELDS: { key: string; label: string; help: string; type?: 'text' | 'textarea' }[] = [
  { key: 'ga_measurement_id', label: 'Google Analytics Measurement ID', help: 'Format: G-XXXXXXXXXX (from analytics.google.com → Admin → Data Streams)' },
  { key: 'gtm_id', label: 'Google Tag Manager ID', help: 'Format: GTM-XXXXXXX (from tagmanager.google.com)' },
  { key: 'fb_pixel_id', label: 'Facebook Pixel ID', help: 'Numeric ID from Meta Events Manager → Data Sources → Pixel.' },
  { key: 'contact_email', label: 'Contact email (footer)', help: 'Public email shown in the footer' },
  { key: 'blog_ad_html', label: 'Google Ads / AdSense banner HTML (blog pages)', help: 'Paste the full <ins> snippet or <iframe> ad code. Shows at the bottom of every blog post.', type: 'textarea' },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.key] = r.value || ''; });
      FIELDS.forEach((f) => { if (!(f.key in map)) map[f.key] = ''; });
      setValues(map);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const rows = FIELDS.map((f) => ({ key: f.key, value: values[f.key] || '', updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    setSaving(false);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: 'Settings saved' });
  };

  if (loading) return <AdminLayout><p className="text-muted-foreground">Loading…</p></AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="section-heading mb-2">Site Settings</h1>
      <p className="text-sm text-muted-foreground mb-6">Tracking, ads, and contact info. Changes apply across the site.</p>

      <div className="product-card space-y-5 max-w-3xl">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-foreground mb-1">{f.label}</label>
            {f.type === 'textarea' ? (
              <textarea
                rows={5}
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background font-mono"
                value={values[f.key] || ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            ) : (
              <input
                className="w-full px-3 py-2 border border-border rounded-md text-sm bg-background"
                value={values[f.key] || ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
              />
            )}
            <p className="text-xs text-muted-foreground mt-1">{f.help}</p>
          </div>
        ))}
        <button onClick={save} disabled={saving} className="btn-primary text-sm py-2 px-4">
          <Save size={14} /> {saving ? 'Saving…' : 'Save settings'}
        </button>
      </div>
    </AdminLayout>
  );
}
