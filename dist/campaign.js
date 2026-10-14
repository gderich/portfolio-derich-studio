/* One shared offer: absolute deadline in Brasília, never reset per visit. */
(() => {
  const campaign = Object.freeze({
    id: 'sites-outubro-2026', enabled: true,
    startsAt: '2026-10-14T00:00:00-03:00',
    endsAt: '2026-10-19T00:00:00-03:00',
    regularPrice: 1500, price: 750
  });
  const money = value => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', maximumFractionDigits: 0
  }).format(value);
  const active = () => campaign.enabled && Date.now() >= Date.parse(campaign.startsAt)
    && Date.now() < Date.parse(campaign.endsAt);
  window.derichOffer = {
    active,
    description: () => active()
      ? `Site de página única: ${money(campaign.price)} (de ${money(campaign.regularPrice)}), campanha até 18/10/2026, horário de Brasília`
      : `Site de página única: ${money(campaign.regularPrice)}`
  };
  const notice = document.querySelector('[data-campaign-notice]');
  const dialog = document.querySelector('#campaign-dialog');
  let previousState;
  function render() {
    const isActive = active();
    if (previousState !== isActive) {
      document.querySelectorAll('[data-site-price]').forEach(el => {
        el.textContent = money(isActive ? campaign.price : campaign.regularPrice);
      });
      document.querySelectorAll('[data-campaign-only]').forEach(el => { el.hidden = !isActive; });
      document.querySelectorAll('[data-regular-price]').forEach(el => { el.textContent = money(campaign.regularPrice); });
      document.querySelectorAll('[data-campaign-saving]').forEach(el => { el.textContent = money(campaign.regularPrice - campaign.price); });
      const option = document.querySelector('[data-site-option]');
      if (option) option.value = option.textContent = window.derichOffer.description();
      const direct = document.querySelector('.sale-direct');
      if (direct) {
        const url = new URL(direct.href);
        url.searchParams.set('text', 'Olá, Derich! Quero uma proposta. ' + window.derichOffer.description());
        direct.href = url.href;
      }
      if (!isActive && dialog?.open) dialog.close();
      previousState = isActive;
    }
    if (!isActive) return;
    const seconds = Math.max(0, Math.ceil((Date.parse(campaign.endsAt) - Date.now()) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    document.querySelectorAll('[data-countdown]').forEach(el => {
      el.textContent = `${values[0]}d ${String(values[1]).padStart(2, '0')}h ${String(values[2]).padStart(2, '0')}m ${String(values[3]).padStart(2, '0')}s`;
    });
  }
  render();
  // Also refresh after tab suspension and immediately before preparing an inquiry.
  setInterval(render, 1000);
  document.addEventListener('visibilitychange', render);
  document.addEventListener('submit', render, true);
  notice?.querySelector('[data-campaign-open]')?.addEventListener('click', event => {
    render();
    if (!active() || !dialog?.showModal) return;
    event.preventDefault();
    dialog.showModal();
  });
  dialog?.querySelector('[data-campaign-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  // Preserve ad attribution from the portfolio to the offer page.
  const source = new URLSearchParams(location.search);
  document.querySelectorAll('a[href^="sites.html"]').forEach(link => {
    const url = new URL(link.href);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
      if (source.has(key)) url.searchParams.set(key, source.get(key).slice(0, 100));
    });
    link.href = url.href;
  });
})();
