import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SiteSettings = Record<string, string>;

let cache: SiteSettings | null = null;
const listeners = new Set<(s: SiteSettings) => void>();

async function fetchAll() {
  const { data } = await supabase.from('site_settings').select('key, value');
  cache = Object.fromEntries((data || []).map((r: any) => [r.key, r.value || '']));
  listeners.forEach((l) => l(cache!));
  return cache;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cache || {});
  const [loading, setLoading] = useState(!cache);
  useEffect(() => {
    listeners.add(setSettings);
    if (!cache) fetchAll().then(() => setLoading(false));
    else setLoading(false);
    return () => { listeners.delete(setSettings); };
  }, []);
  return { settings, loading, refetch: fetchAll };
}

export function getSetting(key: string) {
  return cache?.[key] || '';
}
