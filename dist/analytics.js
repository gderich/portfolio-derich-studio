/* GA4: pageviews use native enhanced measurement (including SPA history).
   No form values or message contents are passed to custom events. */
(() => {
  if (window.__siteAnalyticsLoaded || !/^https?:$/.test(location.protocol) ||
      /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return;
  window.__siteAnalyticsLoaded = true;
  const id = 'G-MWNCMRQLEE';
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', id, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + id;
  document.head.appendChild(tag);
  window.siteTrack = function (name, params) {
    window.gtag('event', name, Object.assign({
      send_to: id, transport_type: 'beacon'
    }, params));
  };
  document.addEventListener('click', function (event) {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link) return;
    let url;
    try { url = new URL(link.href, location.href); } catch { return; }
    if (url.hostname === 'wa.me' || url.hostname === 'api.whatsapp.com') {
      window.siteTrack('whatsapp_click', { page_path: location.pathname });
    }
    if (link.hasAttribute('download') || /\.(pdf|docx?|xlsx?|zip)$/i.test(url.pathname)) {
      window.siteTrack('resource_download_click', { page_path: location.pathname, file_type: url.pathname.split('.').pop().toLowerCase() });
    }
  }, true);
})();
