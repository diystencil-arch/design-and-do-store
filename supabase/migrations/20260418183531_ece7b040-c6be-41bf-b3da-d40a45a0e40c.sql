-- contact_messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages
FOR INSERT
WITH CHECK (
  length(trim(name)) > 0
  AND length(trim(email)) > 3
  AND length(trim(subject)) > 0
  AND length(trim(message)) > 0
  AND length(name) <= 200
  AND length(email) <= 320
  AND length(subject) <= 300
  AND length(message) <= 5000
);

CREATE POLICY "Admins view contact messages"
ON public.contact_messages
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update contact messages"
ON public.contact_messages
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete contact messages"
ON public.contact_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL DEFAULT '',
  cover_image TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone view published posts"
ON public.blog_posts
FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage posts"
ON public.blog_posts
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status, created_at DESC);