import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function DownloadPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [info, setInfo] = useState<{ url: string; title: string; remaining: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setState('error'); setError('Missing token'); return; }
    const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-digital?token=${token}`;
    fetch(fnUrl)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'Failed');
        setInfo(j);
        setState('ready');
      })
      .catch((e) => { setError(e.message); setState('error'); });
  }, [token]);

  return (
    <div className="container-page py-20 max-w-lg text-center">
      {state === 'loading' && <p className="text-muted-foreground">Verifying your download…</p>}
      {state === 'error' && (
        <div className="product-card">
          <AlertCircle className="mx-auto text-destructive mb-3" size={32} />
          <h1 className="section-heading mb-2">Download unavailable</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}
      {state === 'ready' && info && (
        <div className="product-card">
          <CheckCircle2 className="mx-auto text-primary mb-3" size={32} />
          <h1 className="section-heading mb-2">{info.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">Your file is ready. {info.remaining} download{info.remaining === 1 ? '' : 's'} remaining.</p>
          <a href={info.url} className="btn-primary w-full justify-center">
            <Download size={16} /> Download now
          </a>
          <p className="text-xs text-muted-foreground mt-4">Save the file — this link expires in 5 minutes.</p>
        </div>
      )}
    </div>
  );
}
