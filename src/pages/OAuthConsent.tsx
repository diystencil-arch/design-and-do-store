import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Minimal typed wrapper for the beta supabase.auth.oauth namespace.
type OAuthResult = {
  data: {
    client?: { name?: string; client_uri?: string; redirect_uris?: string[] } | null;
    scope?: string;
    scopes?: string[];
    redirect_url?: string;
    redirect_to?: string;
  } | null;
  error: { message: string } | null;
};
const oauthApi = (supabase.auth as unknown as {
  oauth: {
    getAuthorizationDetails: (id: string) => Promise<OAuthResult>;
    approveAuthorization: (id: string) => Promise<OAuthResult>;
    denyAuthorization: (id: string) => Promise<OAuthResult>;
  };
}).oauth;

export default function OAuthConsent() {
  const [params] = useSearchParams();
  const authorizationId = params.get("authorization_id") ?? "";
  const [details, setDetails] = useState<OAuthResult["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!authorizationId) {
        setError("Missing authorization_id in the URL.");
        return;
      }
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        const next = window.location.pathname + window.location.search;
        window.location.href = "/auth?next=" + encodeURIComponent(next);
        return;
      }
      if (!oauthApi) {
        setError("OAuth is not available in this Supabase client.");
        return;
      }
      const { data, error } = await oauthApi.getAuthorizationDetails(authorizationId);
      if (!active) return;
      if (error) {
        setError(error.message);
        return;
      }
      const immediate = data?.redirect_url ?? data?.redirect_to;
      if (immediate && !data?.client) {
        window.location.href = immediate;
        return;
      }
      setDetails(data);
    })();
    return () => {
      active = false;
    };
  }, [authorizationId]);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauthApi.approveAuthorization(authorizationId)
      : await oauthApi.denyAuthorization(authorizationId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  if (error) {
    return (
      <div className="container-page py-20 max-w-md mx-auto text-center">
        <h1 className="section-heading mb-2">Authorization error</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="container-page py-20 text-center text-muted-foreground">Loading authorization…</div>
    );
  }

  const clientName = details.client?.name ?? "An app";
  const scopes = details.scopes ?? (details.scope ? details.scope.split(/\s+/).filter(Boolean) : []);

  return (
    <div className="container-page py-16 max-w-md mx-auto">
      <div className="product-card space-y-5">
        <div>
          <h1 className="section-heading">Connect {clientName} to DIY Stencil</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {clientName} will be able to call this store's enabled tools while you are signed in. This does not
            bypass DIY Stencil's permissions or backend policies.
          </p>
        </div>

        {scopes.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Requested access</p>
            <ul className="text-sm space-y-1">
              {scopes.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <button disabled={busy} onClick={() => decide(true)} className="btn-primary flex-1 disabled:opacity-50">
            {busy ? "Please wait…" : "Approve"}
          </button>
          <button disabled={busy} onClick={() => decide(false)} className="btn-outline flex-1 disabled:opacity-50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
