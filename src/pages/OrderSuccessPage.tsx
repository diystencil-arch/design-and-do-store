import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, Mail } from 'lucide-react';

export default function OrderSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [downloads, setDownloads] = useState<Array<{ title: string; url: string }>>([]);

  useEffect(() => {
    const stash = sessionStorage.getItem('lastDownloads');
    if (stash) {
      try { setDownloads(JSON.parse(stash)); } catch {}
      sessionStorage.removeItem('lastDownloads');
    }
  }, []);

  return (
    <div className="container-page py-16 max-w-2xl text-center">
      <CheckCircle2 className="mx-auto text-primary mb-4" size={48} />
      <h1 className="section-heading mb-2">Thank you for your order!</h1>
      {orderId && <p className="text-sm text-muted-foreground mb-2">Order #{orderId.slice(0, 8)}</p>}
      <p className="text-sm text-muted-foreground mb-8 flex items-center justify-center gap-2">
        <Mail size={14} /> A confirmation has been emailed to you.
      </p>

      {downloads.length > 0 && (
        <div className="product-card text-left mb-6">
          <h2 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Download size={18} /> Your digital downloads
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Click to download. Each link expires in 72 hours and allows 5 downloads.</p>
          <div className="space-y-2">
            {downloads.map((d, i) => (
              <a key={i} href={d.url} className="btn-primary w-full justify-center text-sm">
                <Download size={14} /> {d.title}
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link to="/" className="btn-outline text-sm py-2 px-4">Continue shopping</Link>
        <Link to="/account" className="btn-primary text-sm py-2 px-4">View account</Link>
      </div>
    </div>
  );
}
