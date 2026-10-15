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
  const isHome = document.body.classList.contains('home-page');
  const dismissKey = `${campaign.id}:follower-dismissed`;
  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let previousState;
  let followerDismissed = false;
  let followerVisible = false;
  let morphing = false;

  try { followerDismissed = sessionStorage.getItem(dismissKey) === '1'; } catch (_) {}

  function enhanceHome() {
    if (!isHome) return;
    const lead = document.querySelector('.home-hero .lead');
    if (lead) {
      lead.textContent = 'Sites profissionais para apresentar melhor o seu negócio, facilitar o contato e transformar interesse em oportunidades reais.';
    }

    const actions = document.querySelector('.home-hero .hero-actions');
    if (actions && !document.querySelector('.conversion-points')) {
      const points = document.createElement('div');
      points.className = 'conversion-points';
      points.setAttribute('aria-label', 'O que você recebe');
      points.innerHTML = '<span>Responsivo no celular</span><span>Contato pelo WhatsApp</span><span>Atendimento direto comigo</span>';
      actions.insertAdjacentElement('afterend', points);
    }
  }

  function ensureFollower() {
    if (document.querySelector('[data-campaign-follower]')) return;
    const follower = document.createElement('aside');
    follower.className = 'campaign-follower';
    follower.hidden = true;
    follower.setAttribute('data-campaign-follower', '');
    follower.setAttribute('aria-label', 'Condição especial para criação de site');
    follower.innerHTML = `
      <button type="button" class="campaign-follower-close" aria-label="Fechar oferta">×</button>
      <div class="campaign-follower-copy">
        <span class="campaign-follower-kicker">Condição especial · 50% OFF</span>
        <div class="campaign-follower-price"><del data-regular-price>${money(campaign.regularPrice)}</del><strong data-site-price>${money(campaign.price)}</strong></div>
        <small>Site de apresentação · até 6 seções</small>
      </div>
      <div class="campaign-follower-action">
        <span>Termina em <time data-countdown datetime="${campaign.endsAt}"></time></span>
        <a class="pill" href="${location.pathname.includes('sites') ? '#proposta' : 'sites.html#proposta'}">Quero aproveitar ↗</a>
      </div>`;
    document.body.appendChild(follower);

    follower.querySelector('.campaign-follower-close')?.addEventListener('click', () => {
      followerDismissed = true;
      try { sessionStorage.setItem(dismissKey, '1'); } catch (_) {}
      follower.hidden = true;
      followerVisible = false;
      document.body.classList.remove('campaign-follower-visible');
      if (isEngaged()) notice?.classList.add('campaign-notice-morphed');
    });
  }

  function isEngaged() {
    return window.scrollY > Math.max(420, window.innerHeight * 0.55);
  }

  function shouldShowFollower() {
    return active() && !followerDismissed && !dialog?.open && isEngaged();
  }

  function noticeRect() {
    const rect = notice?.getBoundingClientRect();
    if (rect && rect.width > 0 && rect.height > 0) return rect;
    const header = document.querySelector('.top')?.getBoundingClientRect();
    return { left: 0, top: header?.bottom || 0, width: window.innerWidth, height: 44 };
  }

  function morphOffer(toFollower) {
    const follower = document.querySelector('[data-campaign-follower]');
    if (!notice || !follower || morphing || reduceMotion) return false;
    morphing = true;

    if (toFollower) {
      follower.hidden = false;
      follower.style.visibility = 'hidden';
      notice.classList.remove('campaign-notice-morphed');
    } else {
      notice.classList.remove('campaign-notice-morphed');
      notice.style.visibility = 'hidden';
    }

    const start = toFollower ? noticeRect() : follower.getBoundingClientRect();
    const end = toFollower ? follower.getBoundingClientRect() : noticeRect();
    const ghost = document.createElement('div');
    ghost.className = 'campaign-morph';
    ghost.innerHTML = '<span><b>50% OFF</b><small> Site profissional</small></span><strong>R$ 750</strong>';
    document.body.appendChild(ghost);

    Object.assign(ghost.style, {
      left: `${start.left}px`, top: `${start.top}px`, width: `${start.width}px`, height: `${start.height}px`
    });

    const animation = ghost.animate([
      { left: `${start.left}px`, top: `${start.top}px`, width: `${start.width}px`, height: `${start.height}px`, borderRadius: toFollower ? '0px' : '18px', opacity: .96 },
      { left: `${end.left}px`, top: `${end.top}px`, width: `${end.width}px`, height: `${end.height}px`, borderRadius: toFollower ? '18px' : '0px', opacity: 1 }
    ], { duration: 620, easing: 'cubic-bezier(.22,.85,.3,1)', fill: 'forwards' });

    animation.onfinish = () => {
      ghost.remove();
      if (toFollower) {
        notice.classList.add('campaign-notice-morphed');
        follower.style.visibility = '';
        follower.hidden = false;
        followerVisible = true;
        document.body.classList.add('campaign-follower-visible');
      } else {
        follower.hidden = true;
        follower.style.visibility = '';
        followerVisible = false;
        notice.style.visibility = '';
        notice.classList.remove('campaign-notice-morphed');
        document.body.classList.remove('campaign-follower-visible');
      }
      morphing = false;
    };
    animation.oncancel = animation.onfinish;
    return true;
  }

  function updateFollowerVisibility() {
    const follower = document.querySelector('[data-campaign-follower]');
    if (!follower || morphing) return;

    const engaged = isEngaged();
    const show = shouldShowFollower();

    if (engaged) notice?.classList.add('campaign-notice-morphed');
    else notice?.classList.remove('campaign-notice-morphed');

    if (show && !followerVisible) {
      if (!morphOffer(true)) {
        follower.hidden = false;
        followerVisible = true;
        document.body.classList.add('campaign-follower-visible');
      }
      return;
    }

    if (!engaged && followerVisible) {
      if (!morphOffer(false)) {
        follower.hidden = true;
        followerVisible = false;
        document.body.classList.remove('campaign-follower-visible');
      }
      return;
    }

    if (!show && followerVisible && (followerDismissed || dialog?.open || !active())) {
      follower.hidden = true;
      followerVisible = false;
      document.body.classList.remove('campaign-follower-visible');
    }
  }

  function render() {
    const isActive = active();
    if (previousState !== isActive) {
      document.querySelectorAll('[data-site-price]').forEach(el => {
        el.textContent = money(isActive ? campaign.price : campaign.regularPrice);
      });
      document.querySelectorAll('[data-campaign-only]').forEach(el => { el.hidden = !isActive; });
      document.querySelectorAll('[data-regular-price]').forEach(el => { el.textContent = money(campaign.regularPrice); });
      document.querySelectorAll('[data-campaign-saving]').forEach(el => { el.textContent = money(campaign.regularPrice - campaign.price); });

      const noticeCopy = notice?.querySelector('span');
      if (noticeCopy && isActive) {
        noticeCopy.innerHTML = `Site profissional com <b>50% OFF</b>: de <s>${money(campaign.regularPrice)}</s> por <b>${money(campaign.price)}</b> até 18/10.`;
      }

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

    if (!isActive) {
      updateFollowerVisibility();
      return;
    }

    const seconds = Math.max(0, Math.ceil((Date.parse(campaign.endsAt) - Date.now()) / 1000));
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    document.querySelectorAll('[data-countdown]').forEach(el => {
      el.textContent = `${values[0]}d ${String(values[1]).padStart(2, '0')}h ${String(values[2]).padStart(2, '0')}m ${String(values[3]).padStart(2, '0')}s`;
    });
    updateFollowerVisibility();
  }

  enhanceHome();
  ensureFollower();
  render();

  setInterval(render, 1000);
  document.addEventListener('visibilitychange', render);
  document.addEventListener('submit', render, true);
  window.addEventListener('scroll', updateFollowerVisibility, { passive: true });
  window.addEventListener('resize', updateFollowerVisibility);

  notice?.querySelector('[data-campaign-open]')?.addEventListener('click', event => {
    render();
    if (!active() || !dialog?.showModal) return;
    event.preventDefault();
    dialog.showModal();
    updateFollowerVisibility();
  });

  dialog?.querySelector('[data-campaign-close]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog?.addEventListener('close', updateFollowerVisibility);

  const source = new URLSearchParams(location.search);
  document.querySelectorAll('a[href^="sites.html"]').forEach(link => {
    const url = new URL(link.href);
    ['utm_source', 'utm_medium', 'utm_campaign'].forEach(key => {
      if (source.has(key)) url.searchParams.set(key, source.get(key).slice(0, 100));
    });
    link.href = url.href;
  });
})();
