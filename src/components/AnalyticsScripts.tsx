import { useEffect } from 'react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function AnalyticsScripts() {
  const { settings } = useSiteSettings();
  const ga = settings.ga_measurement_id?.trim();
  const gtm = settings.gtm_id?.trim();
  const fbp = settings.fb_pixel_id?.trim();

  useEffect(() => {
    if (ga && !document.getElementById('ga-script')) {
      const s = document.createElement('script');
      s.id = 'ga-script';
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
      document.head.appendChild(s);
      const inline = document.createElement('script');
      inline.id = 'ga-inline';
      inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`;
      document.head.appendChild(inline);
    }
    if (gtm && !document.getElementById('gtm-script')) {
      const s = document.createElement('script');
      s.id = 'gtm-script';
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`;
      document.head.appendChild(s);
    }
    if (fbp && !document.getElementById('fb-pixel-script')) {
      const s = document.createElement('script');
      s.id = 'fb-pixel-script';
      s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fbp}');fbq('track','PageView');`;
      document.head.appendChild(s);
    }
  }, [ga, gtm, fbp]);

  return null;
}
