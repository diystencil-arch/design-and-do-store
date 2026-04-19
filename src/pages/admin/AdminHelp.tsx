import AdminLayout from '@/components/AdminLayout';
import { Mail, MessageCircle, BookOpen } from 'lucide-react';

export default function AdminHelp() {
  return (
    <AdminLayout>
      <h1 className="section-heading mb-2">Help</h1>
      <p className="text-sm text-muted-foreground mb-6">Quick guides and support contacts.</p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="product-card">
          <BookOpen className="text-primary mb-2" size={20} />
          <h2 className="font-medium text-foreground mb-2">Quick guides</h2>
          <ul className="text-sm space-y-2 text-muted-foreground list-disc pl-5">
            <li><b>Add a product</b>: Products → New product → fill title, type, price, image URL → Save.</li>
            <li><b>Mark order shipped</b>: Orders → enter tracking number → click "Mark shipped".</li>
            <li><b>Publish a blog post</b>: Blog → New post → tick "Published" → Save.</li>
            <li><b>Reply to a customer</b>: Messages → click "Reply →" (opens your email).</li>
            <li><b>Export subscribers</b>: Subscribers → Export CSV.</li>
          </ul>
        </div>
        <div className="product-card">
          <MessageCircle className="text-primary mb-2" size={20} />
          <h2 className="font-medium text-foreground mb-2">Need a hand?</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Contact your developer or Lovable support if anything looks off.
          </p>
          <a href="mailto:diystencil@gmail.com" className="inline-flex items-center gap-2 text-primary text-sm hover:underline">
            <Mail size={14} /> diystencil@gmail.com
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}
