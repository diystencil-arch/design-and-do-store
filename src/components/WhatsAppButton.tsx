import { MessageCircle } from 'lucide-react';

const WHATSAPP_NUMBER = '15197818540'; // +1 519 781 8540
const WHATSAPP_MESSAGE = encodeURIComponent("Hi DIY Stencil! I have a question about your products.");

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <MessageCircle size={22} strokeWidth={2.2} />
      <span className="hidden sm:inline text-sm font-semibold">Chat with us</span>
    </a>
  );
}
